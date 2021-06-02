const fs = require('fs');
const fetch = require('node-fetch');
const colors = require('colors');
require('dotenv').config();
const faunadb = require('faunadb');
const { Collection, Role } = require('faunadb');
const q = faunadb.query;

(async () => {

  // Check for missing environment variables
  for (const varName of ['FAUNA_GRAPHQL_DOMAIN', 'FAUNA_SECRET_ADMIN']) {
    if (typeof process.env[varName] === 'undefined') {
      throw new Error(`Environment variable ${varName} is missing.`);
    }
  }

  const {
    FAUNA_GRAPHQL_DOMAIN,
    FAUNA_DOMAIN,
    FAUNA_SECRET_ADMIN,
  } = process.env;

  // Prepare Fauna client with the secret admin key
  const clientOptions = {
    secret: FAUNA_SECRET_ADMIN,
  };

  // If a URI for Fauna requests has been specified, parse it
  if (typeof FAUNA_DOMAIN !== 'undefined') {
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

    // Send the file to Fauna
    await fetch(`${FAUNA_GRAPHQL_DOMAIN}/import`, {
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

  // Redefine "create user" resolver to include authentication information
  const updateCreateUserResolver = await client.query(
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
  
  // Define "login user" resolver
  const updateLoginUserResolver = await client.query(
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

  await client.query(
    q.Update(q.Function("current_user"), {
      "body": q.Query(
        q.Lambda([],
          q.Get(q.CurrentIdentity())
        )
      )
    })
  );

  await client.query(
    q.If(
      q.Exists(q.Role("user")),
      q.Delete(q.Role("user")),
      null
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

  await client.query(
    q.CreateRole({
      name: "user",
      membership: {
        resource: q.Collection("User")
      },
      privileges: [
        {
          resource: q.Collection("Task"),
          actions: {
            read: isAuthor,
            create: true,
            write: isAuthor,
            delete: isAuthor,
          }
        },
        {
          resource: q.Function('current_user'),
          actions: {
            call: true
          }
        }
      ]
    })
  );

})();

