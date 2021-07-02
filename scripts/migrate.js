const fs = require('fs');
const fetch = require('node-fetch');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
require('dotenv').config();
const faunadb = require('faunadb');
const q = faunadb.query;

(async () => {

  // Check for missing environment variables
  for (const varName of ['NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN', 'FAUNA_SECRET_ADMIN']) {
    if (typeof process.env[varName] === 'undefined') {
      throw new Error(`Environment variable ${varName} is missing.`);
    }
  }

  const {
    NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN,
    FAUNA_DOMAIN,
    FAUNA_SECRET_ADMIN,
  } = process.env;

  // Prepare Fauna client with the secret admin key
  const clientOptions = {
    secret: FAUNA_SECRET_ADMIN,
  };

  // If a URI for Fauna requests has been specified, parse it
  if (typeof FAUNA_DOMAIN !== 'undefined') {
    // eslint-disable-next-line no-useless-escape
    const match = FAUNA_DOMAIN.match(/^(https?):\/\/([\w\.]+)(?::(\d+))?$/);

    // If no match was found, it means that the given string is not a valid URI.
    if (!match) {
      throw new Error('FAUNA_DOMAIN environment variable must be a valid URI.');
    }

    clientOptions.scheme = match[1];
    clientOptions.domain = match[2];

    if (typeof match[3] !== 'undefined') {
      clientOptions.port = match[3];
    }
  }

  // Create Fauna client
  const client = new faunadb.Client(clientOptions);

  // Define the process of importing the GraphQL schema
  const importSchema = async () => {
    // Read the schema from the .graphql file
    const stream = fs.createReadStream('schema.graphql');
    let overrideOption = false;
    const args = process.argv.slice(2);
    if (args.includes('-o') || args.includes('--override')) {
      overrideOption = true;
    }

    // If override option has not been specified
    if (!overrideOption) {
      console.log(' Override schema option is deactivated '.black.bgYellow, '\n',
        'Override option has not been specified. You can specify it by adding the -o or --override flag.'.bold)
    } else {
      console.log(' Override schema option is activated '.black.bgYellow)
    }

    await fetch(`${NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN}/import${overrideOption ? '?mode=override' : ''}`, {
      method: 'POST',
      body: stream,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${FAUNA_SECRET_ADMIN}`,
      }
    })
      .then(response => {
        if (response.ok) {
          console.log(`Schema has been sucessfully imported\n`.green.bold, `Status code: `.bold, `${response.status} `.yellow.bold)
          return;
        }

        switch (response.status) {
          case 401:
            console.log(`Access denied - Please verify FAUNA_SECRET_ADMIN in environement variables\n`.red.bold, `Status code: ${response.status}`.yellow.bold)
            return;
        }

      });
  }

  // Import the GraphQL schema into Fauna
  await importSchema();

  console.log('Defining resolvers…'.yellow)
  // Redefine "create user" resolver to include authentication information
  await client.query(
    q.Update(q.Function("signup_user"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Let(
            {
              createdUser: q.Create(q.Collection("User"), {
                data: {
                  username: q.Select("username", q.Var("input"))
                },
                credentials: {
                  password: q.Select("password", q.Var("input"))
                }
              })
            },
            q.Call(
              q.Function("login_user"),
              q.Var("input")
            )
          )
        )
      )
    })
  );

  // Define user login resolver
  await client.query(
    q.Update(q.Function("login_user"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Let(
            {
              loginData: q.Login(
                q.Match(q.Index("unique_User_username"), q.Select("username", q.Var("input"))),
                { password: q.Select("password", q.Var("input")) }
              )
            },
            {
              instance: q.Select("instance", q.Var("loginData")),
              secret: q.Select("secret", q.Var("loginData")),
            }
          )
        )
      )
    })
  );

  // Define user logout resolver
  await client.query(
    q.Update(q.Function("logout_user"), {
      "body": q.Query(
        q.Lambda([],
          q.Logout(
            true
          )
        )
      )
    })
  );

  // Define "current user" resolver
  await client.query(
    q.Update(q.Function("current_user"), {
      "body": q.Query(
        q.Lambda([],
          q.If(q.HasCurrentIdentity(), q.Get(q.CurrentIdentity()), null)
        )
      )
    })
  );

  // ---------------------------------------------------------------
  // Define create project resolver
  await client.query(
    q.Update(q.Function("create_project"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Create(q.Collection("Project"), {
            data: {
              name: q.Select("name", q.Var("input")),
              owningCompany: q.Select(['data', 'company'], q.Get(q.CurrentIdentity()))
            }
          })
        )
      )
    })
  );

  // ---------------------------------------------------------------

  console.log('Deleting existing roles…'.yellow)
  // Delete all existing roles
  await client.query(
    q.Map(
      q.Paginate(q.Roles()),
      q.Lambda('X', q.Delete(q.Var('X')))
    )
  );

  // ANCHOR Define a role with a set of basic access rules for non-authenticated users
  console.info('Creating guest role…'.yellow);
  await client.query(
    q.CreateRole({
      name: 'guest',
      privileges: [
        {
          resource: q.Index("unique_User_username"),
          actions: {
            read: true
          }
        },
        // Guests can access the "sign up user" action
        {
          resource: q.Function('signup_user'),
          actions: {
            call: true
          }
        },
        // Guests can log into the application
        {
          resource: q.Function('login_user'),
          actions: {
            call: true
          }
        },
        // Guests can access users' login information
        {
          resource: q.Collection("User"),
          actions: {
            read: true,
            create: true
          }
        }
      ]
    })
  );


  // Generate an access token with guest privileges
  console.log('Generating key for guest role…'.yellow)
  const guestKey = await client.query(
    q.CreateKey({
      role: q.Role('guest'),
      data: {
        name: 'For guests',
      },
    })
  );

  console.log(`NEXT_PUBLIC_FAUNA_SECRET=${guestKey.secret}`.bgBlack.white);

  console.log('Defining privileges…'.yellow)
  // Define a set of access rules
  await client.query(
    q.CreateRole({
      name: "user",
      membership: {
        // These rules apply to all authentified users
        resource: q.Collection("User")
      },
      privileges: [
        // Users can access only their own user data
        {
          resource: q.Collection("User"),
          actions: {
            read: q.Query(
              q.Lambda(
                'ref',
                q.Equals(
                  q.CurrentIdentity(),
                  q.Var('ref')
                )
              )
            )
          }
        },
        // Users can access the Company collection
        {
          resource: q.Collection("Company"),
          actions: {
            create: true,
            read: true,
            write: true,
            delete: true
          }
        },
        {
          resource: q.Collection("Project"),
          actions: {
            // Authenticated users can create projects
            create: true,
            // Users can access Project documents only if they share the same company
            read: q.Query(ref =>
              q.Equals(
                q.Select(['data', 'company'], q.Get(q.CurrentIdentity())),
                q.Select(['data', 'owningCompany'], q.Get(ref))
              )),
            // Users can only update a project if they are from the owning company
            write: q.Query((oldData, newData) =>
              q.And(
                q.Equals(
                  q.Select(['data', 'company'], q.Get(q.CurrentIdentity())),
                  q.Select(["data", "owningCompany"], oldData)
                ),
                q.Equals(
                  q.Select(["data", "owningCompany"], oldData),
                  q.Select(["data", "owningCompany"], newData),
                )
              )
            ),
            // Users can delete Project documents only if they share the same company
            delete: q.Query(ref =>
              q.Equals(
                q.Select(['data', 'company'], q.Get(q.CurrentIdentity())),
                q.Select(['data', 'owningCompany'], q.Get(ref))
              ))
          }
        },
        // Users can access the Mission collection
        {
          resource: q.Collection("Mission"),
          actions: {
            create: true,
            read: true,
            write: true,
            delete: true
          }
        },
        // Users can access the MissionUnit collection
        {
          resource: q.Collection("MissionUnit"),
          actions: {
            create: true,
            read: true,
            write: true,
            delete: true
          }
        },
        {
          resource: q.Collection("MissionOffer"),
          actions: {
            create: true,
            read: true,
            write: true,
            delete: true
          }
        },
        {
          resource: q.Collection("Invoice"),
          actions: {
            create: true,
            read: true,
            write: true,
            delete: true
          }
        },
        // Users can access the action that returns their own user data
        {
          resource: q.Function('current_user'),
          actions: {
            call: true
          }
        },
        // User can log out
        {
          resource: q.Function('logout_user'),
          actions: {
            call: true
          }
        },
        {
          resource: q.Function('create_project'),
          actions: {
            call: true
          }
        },
        // INDEXES
        {
          resource: q.Index("unique_User_username"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("allProjects"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("allCompanys"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("allMissions"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("allMissionUnits"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("allMissionOffers"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("allInvoices"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("company_employees_by_company"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("client_company_by_company"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("authorized_project_by_company"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("authorized_project_by_company_and_project"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("client_company_by_company"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("offered_missions_by_company"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("offering_company_by_company"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("authorized_project_by_project"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("missionUnit_mission_by_mission"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("missionOffer_missionUnit_by_missionUnit"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("mission_project_by_project"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("project_owner_by_company"),
          actions: {
            read: true
          }
        },
      ]
    })
  );

  console.log('Migration OK'.green)

})()
  .catch(error => console.error(error));
