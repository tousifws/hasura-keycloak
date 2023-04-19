# Hasura Keycloak

-   Prerequisite:

    -   Docker
    -   NodeJS v14 or later
    -   Pnpm
    -   [Dbmate](https://github.com/amacneil/dbmate) (used for handling migrations)
    -   [Task](https://taskfile.dev/)

-   Installation

    1. pnpm install
    2. task composeUp - Will start the containers defined in docker-compose file

-   Startup the server

    1. cd apps/backend_server
    2. task startUp
    3. pnpm kysely:gen - Kysely codegen
    4. pnpm kysely:seed - It will seed the db with test data

After creating the realm, enable the `HASURA_GRAPHQL_JWT_SECRET` environment variable in the docker-compose file
