# Next.js/FaunaDB To-do list 

## Techs

- Next.js
- FaunaDB
- Apollo
- ChakraUI

# Installation

## (Dev) Install FaunaDB locally

- Download and install Docker: https://docs.docker.com/get-docker/
- Open a terminal and enter the following commands:

```
docker pull fauna/faunadb
docker run --name faunadb -p 8443:8443 -p 8084:8084 fauna/faunadb
```

![windows powershell](https://i.ibb.co/ftNt5nr/faunadocker1.png)

- Once the Docker container has been created, open the FaunaDB CLI.

![docker faunadb cli](https://i.ibb.co/wyTQcmm/faunadocker2.png)

- Entre the following commands in order to create and set up a new database:

```
fauna add-endpoint http://localhost:8443/ --alias localhost --key secret
fauna create-database development_db --endpoint=localhost
fauna create-key development_db --endpoint=localhost
```

- Save the ```FAUNADB_KEY``` generated.


> More informations on how to install locally a faunadb server & credits:
> https://dev.to/englishcraig/how-to-set-up-faunadb-for-local-development-5ha7

<hr/>

## (Prod) Create a FaunaDB account

- Go to: https://fauna.com/

- Log in

- Create a database

![FaunaDB - Création d'une database](https://i.ibb.co/z2TW36C/fauna13.png)

- Go to the Security tab and create a new key

![FaunaDB - Générer une clé](https://i.ibb.co/qRQGmy0/fauna3.png)

> More informations:
> https://docs.fauna.com/fauna/current/start/index.html

## Clone and set up the project

- Clone the project thanks to the following command:

```
git clone [https ou ssh url, selon configuration]
```

- Once the project has been cloned, install all the needed dependencies:

```
yarn install
```

- Create two files named ```.env``` and ```.env.local``` in the root directory.

- Two files ```.env.example``` et ```.env.local.example``` are provided, copy and paste their content.

<hr />

### (1) If FaunaDB is locally installed

- Put the following in your ```.env``` file:

```
FAUNA_SECRET_ADMIN=secret key generated while configuring the db
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=http://localhost:8084
FAUNA_DOMAIN=http://localhost:8443
```

- Then, put the following in your ```.env.local``` file:

```
FAUNA_SECRET_ADMIN=secret key generated while configuring the db
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=http://localhost:8084
FAUNA_DOMAIN=http://localhost:8443
```

### (2) If a FaunaDB account is used (serverless)

- Put the following in your ```.env``` file:

```
FAUNA_SECRET_ADMIN=secret key generated in the Security tab
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=https://graphql.fauna.com
FAUNA_DOMAIN=https://graphql.fauna.com
```

- Then, put the following in your ```.env.local``` file:

```
FAUNA_SECRET_ADMIN=secret key generated in the Security tab
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=https://graphql.fauna.com
FAUNA_DOMAIN=https://graphql.fauna.com
```

<hr />

## Project configuration 

- Run:

```
yarn schema-import
```

- Save the generated key:

![clé user](https://i.ibb.co/k1krw9K/projetconfig1.png)


- Put the generated key in your ```.env.local``` file:

```
NEXT_PUBLIC_FAUNA_SECRET=generated key obtained by running yarn schema-import
```

- Then run the following command in order to put some false data into the db:

```
yarn fixtures
```

- Finally, run:

```
yarn dev
```

And go to [http://localhost:3000](http://localhost:3000) to see the result!

![todolist](https://i.ibb.co/c1hTCmn/projetconfig2.png)


