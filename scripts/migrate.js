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
    let overrideOption = null;
    const args = process.argv.slice(2).join();
    const match = args.match(/^override=(true|false)$/);

    // If override option has not been specified
    if (!match) {
      console.log(' Override schema option is deactivated '.black.bgYellow, '\n',
      'Override option has not been specified. You can specify it by running \'yarn migration override=[true, false]\''.bold)
    }

    // If override option has been specified
    if (match) {
      // if override=true
      if (match[1] === 'true') {
        console.log(' Override schema option is activated '.black.bgYellow)
        overrideOption = '?mode=override';
      }

      // if override=false
      if (match[1] === 'false') {
        console.log(' Override schema option is deactivated '.black.bgYellow)
      }
    }

    await fetch(`${NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN}/import${overrideOption}`, {
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
    q.Update(q.Function("create_user"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Create(q.Collection("User"), {
            data: {
              username: q.Select("username", q.Var("input")),
              role: q.Select("role", q.Var("input")),
            },
            credentials: {
              password: q.Select("password", q.Var("input"))
            }
          })
        )
      )
    })
  );

  // Define user login resolver
  await client.query(
    q.Update(q.Function("login_user"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Select(
            "secret",
            q.Login(
              q.Match(q.Index("unique_User_username"), q.Select("username", q.Var("input"))),
              { password: q.Select("password", q.Var("input")) }
            )
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

  // Define "create task" resolver
  await client.query(
    q.Update(q.Function("create_task"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Create(q.Collection("Task"), {
            data: {
              title: q.Select("title", q.Var("input")),
              completed: false,
              user: q.CurrentIdentity()
            }
          })
        )
      )
    })
  );

  // Define "updateTaskTitle" resolver
  await client.query(
    q.Update(q.Function("update_task_title"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Update(q.Ref(q.Collection('Task'), q.Select("id", q.Var("input"))), {
            data: {
              title: q.Select("title", q.Var("input")),
              user: q.CurrentIdentity(),
            }
          })
        )
      )
    })
  );

  // Define "updateTaskCompleted" resolver
  await client.query(
    q.Update(q.Function("update_task_completed"), {
      "body": q.Query(
        q.Lambda(["input"],
          q.Update(q.Ref(q.Collection('Task'), q.Select("id", q.Var("input"))), {
            data: {
              completed: q.Select("completed", q.Var("input")),
              user: q.CurrentIdentity(),
            }
          })
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

  console.log('Deleting existing roles…'.yellow)
  // Delete all existing roles
  await client.query(
    q.Map(
      q.Paginate(q.Roles()),
      q.Lambda('X', q.Delete(q.Var('X')))
    )
  );

  const isAuthor = q.Query(
    q.Lambda(
      'ref',
      q.Equals(
        q.CurrentIdentity(),
        q.Select(['data', 'user'], q.Get(q.Var('ref')))
      )
    )
  );

  // ANCHOR Define a role with a set of basic access rules for non-authenticated users
  console.info('Creating guest role…'.yellow);
  await client.query(
    q.CreateRole({
      name: 'guest',
      privileges: [
        // Guests can access the list of all usernames (required to sign in)
        {
          resource: q.Index("unique_User_username"),
          actions: {
            read: true
          }
        },
        // Guests can log into the application
        {
          resource: q.Function('login_user'),
          actions: {
            call: true
          }
        },
        // Guests can access the "get current user" action (which should always return null for them)
        {
          resource: q.Function('current_user'),
          actions: {
            call: true
          }
        },
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
        // Users can access a list of all tasks (individual tasks for which access is not permitted will be filtered out)
        {
          resource: q.Index("allTasks"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("unique_User_username"),
          actions: {
            read: true
          }
        },
        {
          resource: q.Index("task_user_by_user"),
          actions: {
            read: true
          }
        },
        // Users can create new tasks, but they can read, modify and delete tasks only if they created them in the first place
        {
          resource: q.Collection("Task"),
          actions: {
            // Authenticated users can always create new tasks
            create: true,
            // Authenticated users can only read tasks they have created
            read: isAuthor,
            // Authenticated users can only modify tasks they have created, and cannot change their owner
            write: q.Query(
              q.Lambda(
                ['oldData', 'newData'],
                q.And(
                  // Identity of current user is compared to identity of old user/original creator of the task
                  q.Equals(
                    q.CurrentIdentity(),
                    q.Select(['data', 'user'], q.Var('oldData'))
                  ),
                  // Identity of the new 'writer' is compared to identity of old user/original creator of the task
                  q.Equals(
                    q.Select(['data', 'user'], q.Var('newData')),
                    q.Select(['data', 'user'], q.Var('oldData'))
                  )
                )
              )
            ),
            // Authenticated users can only delete tasks they have created
            delete: isAuthor,
          }
        },

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
            ),
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
        // Users can access the action the function that allows a user to create a task
        {
          resource: q.Function('create_task'),
          actions: {
            call: true
          }
        },
        // Users can update the title of a task
        {
          resource: q.Function('update_task_title'),
          actions: {
            call: true
          }
        },
        // Users can update the state of task (to do/completed - true/false)
        {
          resource: q.Function('update_task_completed'),
          actions: {
            call: true
          }
        }
      ]
    })
  );

  console.log('Migration OK'.green)

})()
  .catch(error => console.error(error));
