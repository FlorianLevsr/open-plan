require('dotenv').config();
// eslint-disable-next-line no-unused-vars
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

  const { User, Project, Company, Mission, MissionOffer, MissionUnit, Invoice } = data;

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

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing Company collection…'.yellow);

  for (const company of Company) {
    const {
      id,
      name,
      siret,
      iban,
      address,
      employees,
      projects,
      authorizedProjects,
      providedUnits,
      acceptedUnits,
      offeredMissions,
      offeringMissions,
      issuedInvoices,
      receivedInvoices
    } = company;

    await client.query(
      q.Create(
        q.Ref(
          q.Collection('Company'),
          id,
        ),
        {
          data: {
            name,
            siret,
            iban,
            address,
            employees: q.Map(
              employees,
              q.Lambda('x',
                q.Ref(q.Collection('User'), q.Var('x')
                ))),
            projects: q.Map(
              projects,
              q.Lambda('x',
                q.Ref(q.Collection('Project'), q.Var('x')
                ))),
            authorizedProjects: q.Map(
              authorizedProjects,
              q.Lambda('x',
                q.Ref(q.Collection('Project'), q.Var('x')
                ))),
            providedUnits: q.Map(
              providedUnits,
              q.Lambda('x',
                q.Ref(q.Collection('MissionUnit'), q.Var('x')
                ))),
            acceptedUnits: q.Map(
              acceptedUnits,
              q.Lambda('x',
                q.Ref(q.Collection('MissionUnit'), q.Var('x')
                ))),
            offeredMissions: q.Map(
              offeredMissions,
              q.Lambda('x',
                q.Ref(q.Collection('MissionOffer'), q.Var('x')
                ))),
            offeringMissions: q.Map(
              offeringMissions,
              q.Lambda('x',
                q.Ref(q.Collection('MissionOffer'), q.Var('x')
                ))),
            issuedInvoices: q.Map(
              issuedInvoices,
              q.Lambda('x',
                q.Ref(q.Collection('Invoice'), q.Var('x')
                ))),
            receivedInvoices: q.Map(
              receivedInvoices,
              q.Lambda('x',
                q.Ref(q.Collection('Invoice'), q.Var('x')
                ))),
          },
        },
      )
    )
      .catch(error => console.error(error))
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing User collection…'.yellow);

  for (const user of User) {
    const { id, username, password, company } = user;

    await client.query(
      q.Create(
        q.Ref(
          q.Collection('User'),
          id,
        ),
        {
          data: {
            username,
            company: q.Ref(q.Collection('Company'), company),
          },
          credentials: {
            password,
          }
        },
      )
    )
      .catch(error => console.error(error))
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing Project collection…'.yellow);

  for (const project of Project) {
    const { id, name, place, rate, owningCompany, authorizedCompanies, missions } = project;

    await client.query(
      q.Create(
        q.Ref(
          q.Collection('Project'),
          id,
        ),
        {
          data: {
            name,
            place,
            rate,
            owningCompany: q.Ref(q.Collection('Company'), owningCompany),
            authorizedCompanies: q.Map(
              authorizedCompanies,
              q.Lambda('x',
                q.Ref(q.Collection('Company'), q.Var('x')
                ))),
            missions: q.Map(
              missions,
              q.Lambda('x',
                q.Ref(q.Collection('Mission'), q.Var('x')
                ))),
          },
        },
      )
    )
      .catch(error => console.error(error))
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing Mission collection…'.yellow);

  for (const mission of Mission) {
    const { id, name, rate, project, units } = mission;

    await client.query(
      q.Create(
        q.Ref(
          q.Collection('Mission'),
          id,
        ),
        {
          data: {
            name,
            rate,
            project: q.Ref(q.Collection('Project'), project),
            units: q.Map(
              units,
              q.Lambda('x',
                q.Ref(q.Collection('MissionUnit'), q.Var('x')
                ))),
          },
        },
      )
    )
      .catch(error => console.error(error))
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing MissionUnit collection…'.yellow);

  for (const missionUnit of MissionUnit) {
    const { id, date, quantity, mission, provider, freelancer, missionOffers } = missionUnit;

    await client.query(
      q.Create(
        q.Ref(
          q.Collection('MissionUnit'),
          id,
        ),
        {
          data: {
            date,
            quantity,
            mission: q.Ref(q.Collection('Mission'), mission),
            provider: q.Ref(q.Collection('Company'), provider),
            freelancer: q.Ref(q.Collection('Company'), freelancer),
            missionOffers: q.Map(
              missionOffers,
              q.Lambda('x',
                q.Ref(q.Collection('MissionOffer'), q.Var('x')
                ))),
          },
        },
      )
    )
      .catch(error => console.error(error))
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing MissionOffer collection…'.yellow);

  for (const missionOffer of MissionOffer) {
    const { id, createdAt, status, missionUnit, offeredCompany, offeringCompany } = missionOffer;

    await client.query(
      q.Create(
        q.Ref(
          q.Collection('MissionOffer'),
          id
        ),
        {
          data: {
            createdAt,
            status,
            missionUnit: q.Ref(q.Collection('MissionUnit'), missionUnit),
            offeredCompany: q.Ref(q.Collection('Company'), offeredCompany),
            offeringCompany: q.Ref(q.Collection('Company'), offeringCompany),
          },
        },
      )
    )
      .catch(error => console.error(error))
  }

  console.log('Processing: data.json'.bold.yellow, '\n', 'Importing Invoice collection…'.yellow);

  for (const invoice of Invoice) {
    const { id, number, issuedDate, dueDate, paid, clientCompany, sellerCompany } = invoice;

    await client.query(
      q.Create(
        q.Ref(
          q.Collection('Invoice'),
          id
        ),
        {
          data: {
            number,
            issuedDate,
            dueDate,
            paid,
            clientCompany: q.Ref(q.Collection('Company'), clientCompany),
            sellerCompany: q.Ref(q.Collection('Company'), sellerCompany)
          },
        },
      )
    )
      .catch(error => console.error(error))
  }

  console.log('Seeding OK'.green);

})();