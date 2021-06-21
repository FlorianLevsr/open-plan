require('dotenv').config();
const colors = require('colors');
const faunadb = require('faunadb');
const q = faunadb.query;

const data = require('../data.json');

(async () => {

  // Check for missing environment variables
  for (const varName of ['NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN', 'FAUNA_SECRET_ADMIN']) {
    if (typeof process.env[varName] === 'undefined') {
      throw new Error(`Environment variable ${varName} is missing.`);
    }
  }

  const {
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

  const { User, Task } = data;

  console.log('Cleaning current collections…'.bold.yellow);

  for (const collectionName of Object.keys(data)) {
    await client.query(
      q.Map(
        q.Paginate(
          q.Match(q.Index(`all${collectionName}s`))
        ),
        q.Lambda("X", q.Delete(q.Var("X")))
      )
    )
    .catch(error => console.error(error));
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing User collection…'.yellow);

  for (const user of User) {
    const { id, username, password } = user;
    
    await client.query(
      q.Create(
        q.Ref(
          q.Collection('User'),
          id,
        ),
        {
          data: {
            username,
          },
          credentials: {
            password,
          }
        },
      )
    )
    .catch(error => console.error(error))
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing Task collection…'.yellow);

  for (const task of Task) {
    const { id, title, completed, userId } = task;
    
    await client.query(
      q.Create(
        q.Ref(
          q.Collection('Task'),
          id,
        ),
        {
          data: {
            title,
            completed,
            user: q.Ref(q.Collection('User'), userId),
          },
        },
      )
    )
    .catch(error => console.error(error))
  }

  console.log('Seeding OK'.green);

})();