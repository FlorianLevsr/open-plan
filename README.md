# Next.js/FaunaDB To-do list 

## Techs

- Next.js
- FaunaDB
- Apollo
- ChakraUI

# Installation

## (Dev) Installer FaunaDB en local

- Télécharger et installer Docker: https://docs.docker.com/get-docker/
- Ouvrir Windows Powershell/un terminal et saisir les commandes suivantes:

```
docker pull fauna/faunadb
docker run --name faunadb -p 8443:8443 -p 8084:8084 fauna/faunadb
```

![windows powershell](https://i.ibb.co/ftNt5nr/faunadocker1.png)

- Une fois le container Docker créé, ouvrir le CLI de FaunaDB.

![docker faunadb cli](https://i.ibb.co/wyTQcmm/faunadocker2.png)

- Saisir les commandes suivante spour créer une database:

```
fauna add-endpoint http://localhost:8443/ --alias localhost --key secret
fauna create-database development_db --endpoint=localhost
fauna create-key development_db --endpoint=localhost
```

- Récupérer la ```FAUNADB_KEY``` (clé d'accès à la DB/clé administrateur) générée lors de la dernière commande saisie. 


> Plus d'informations sur la procédure d'installation et source:
> https://dev.to/englishcraig/how-to-set-up-faunadb-for-local-development-5ha7

<hr/>

## (Prod) Créer un compte FaunaDB

- Se rendre sur: https://fauna.com/

- Se connecter

- Créer une database

![FaunaDB - Création d'une database](https://i.ibb.co/z2TW36C/fauna13.png)

- Se rendre dans l'onglet Security et générer une clé d'accès

![FaunaDB - Générer une clé](https://i.ibb.co/qRQGmy0/fauna3.png)

> Plus d'informations sur la procédure de création:
> https://docs.fauna.com/fauna/current/start/index.html

## Récupérer et mettre en place le projet

- Récupérer le projet à l'aide de la commande suivante:

```
git clone [https ou ssh url, selon configuration]
```

- Une fois le projet récupérer, installer les dépendences nécessaires à l'application:

```
yarn install
```

- Une fois les dépendences installées, créer deux fichiers ```.env``` et ```.env.local``` à la racine du projet.

- Deux fichiers ```.env.example``` et ```.env.local.example``` sont fournis et disponible à la racine du projet. Copier-coller leurs contenus.

<hr />

### (1) Si FaunaDB est installé localement

- Renseigner dans le fichier ```.env```

```
FAUNA_SECRET_ADMIN=clé secrète générée lors de la création de la database
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=http://localhost:8084
FAUNA_DOMAIN=http://localhost:8443
```

- Renseigner dans le fichier ```.env.local```

```
FAUNA_SECRET_ADMIN=clé secrète générée lors de la création de la database
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=http://localhost:8084
FAUNA_DOMAIN=http://localhost:8443
```

### (2) Si un compte FaunaDB est utilisé (serverless)

- Renseigner dans le fichier ```.env```

```
FAUNA_SECRET_ADMIN=clé secrète générée dans l'onglet Security
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=https://graphql.fauna.com
FAUNA_DOMAIN=https://graphql.fauna.com
```

- Renseigner dans le fichier ```.env.local```

```
FAUNA_SECRET_ADMIN=clé secrète générée dans l'onglet Security
NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN=https://graphql.fauna.com
FAUNA_DOMAIN=https://graphql.fauna.com
```

<hr />

## Mise en place du projet (suite)

- Executer la commande suivante:

```
yarn schema-import
```

- Récupérer la clé générée:

![clé user](https://i.ibb.co/k1krw9K/projetconfig1.png)


- Placer cette clé dans le fichier ```.env.local``` précédement créé en ajoutant la ligne suivante:

```
NEXT_PUBLIC_FAUNA_SECRET=la clé générée par la commande yarn schema-import
```

- Executer ensuite la commande suivante pour remplir la base de données avec des données factices:

```
yarn fixtures
```

- Enfin, executer la commande suivante:

```
yarn dev
```

Et se rendre à l'adresse [http://localhost:3000](http://localhost:3000)

![todolist](https://i.ibb.co/c1hTCmn/projetconfig2.png)


