# Running the Taxi Registry Locally

## Prerequisites

In addition to the Dev Container prerequisites (see [Using a Dev Container](using-dev-container.md)), install the following tools on your **host machine**:

1. [DBeaver](https://dbeaver.io/download/) — PostgreSQL client
2. [MongoDB Compass](https://www.mongodb.com/try/download/compass) — MongoDB GUI
3. [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) — includes `mongorestore` CLI
4. Download backups-to-init-dev-container.zip

Database setup and migrations are not fully automated. Please contact the taxi registry team to download the file **backups-to-init-dev-container.zip** required to set up databases locally, then extract it locally. In the rest of the document, $backups-to-init-dev-container refers to the location the zip was extracted.

## Setup Steps

### 1. Start the Dev Container

Follow the [Using a Dev Container](using-dev-container.md) guide to clone and open [montreal-taxi-registry](https://github.com/VilledeMontreal/montreal-taxi-registry) in a Dev Container.

The Dev Container starts local instances of **PostgreSQL**, **MongoDB**, and **OSRM**.

> **Note:** The first launch is slow because it downloads the PostgreSQL, MongoDB, and OSRM images. Subsequent launches are fast.

### 2. Restore the PostgreSQL Database

Run the restore using `pg_restore` (example using the DBeaver-bundled binary on Windows) with this **PowerShell** command:

If pg_restore is not recognized as a global command

```powershell
cd C:\Users\<your-user>\AppData\Roaming\DBeaverData\drivers\clients\postgresql\win\17\
```

```powershell
& ".\pg_restore.exe" --verbose --host=localhost --port=5432 --username=vdm_txp --dbname=vdm_txp --format=c --no-owner --no-privileges   "$backups-to-init-dev-container\postgre\taxi-registry-local-db.sql"
```

> password: vdm_txp

**Expected 2 warnings (safe to ignore):**

The restore should complete with: `pg_restore: warning: errors ignored on restore: 2`

- `unrecognized configuration parameter "transaction_timeout"` — The DBeaver-bundled `pg_restore` version is newer than the `postgis/postgis:15-3.5` Docker image.
- `schema "public" already exists` — PostGIS is pre-installed in the `public` schema on the `postgis/postgis:15-3.5` image.

### 3. Verify the PostgreSQL Database

Connect to the local PostgreSQL database using DBeaver and connect to verify the database was restored correctly.

- host: localhost
- port: 5432
- database: vdm_txp
- username: vdm_txp
- password: vdm_txp

### 4. Restore the MongoDB Database

Run the restore using `mongorestore` with this **PowerShell** command:

If mongorestore is not recognized as a global command

```powershell
cd C:\path-where-you-downloaded-mongorestore
```

```powershell
mongorestore --uri="mongodb://vdm_txp:vdm_txp@localhost:27020/?authSource=admin" --nsInclude="vdm_txp.*" $backups-to-init-dev-container\mongo\backup_schema
```

> **Important:** The `authSource=admin` parameter is required. Without it, authentication will fail against the local MongoDB instance.

### 5. Verify the MongoDB Database

Connect to the mongo local database using MongoDB Compass and connect to verify the collection was restored correctly.

Connection string: mongodb://vdm_txp:vdm_txp@127.0.0.1:27020/?authSource=admin

> The standard port 27017 is used inside the container, but 27020 is used from outside of the container to prevent port clash with other mongo installation.

### 6. Building and Running the Application

The codebase is pre-configured for local execution. Build and run the Api Node.js, then run the API Tests to make sure your the setup is completed.

## Building and Running the Application

### Api Node.js

Open a javascript debug terminal (standard bash terminal won't allows for debugging).

From the directory `./le-taxi-api-node.js`:

To use the right node version `nvm use`

> this is required because the ui required an old node version, but the remaining part of the code base is up to date.

To install, run `npm install`.

To execute, run `npm run start-localhost`.

### API Tests

The behavior of the taxi registry is mainly checked using API tests. These tests are using the [@villedemontreal/concurrent-api-tests](https://github.com/VilledeMontreal/concurrent-api-tests) library and the approach described in [Concurrent API Tests](https://github.com/VilledeMontreal/concurrent-api-tests), in order to have reliable, maintainable and fast tests to run.

Open a javascript debug terminal (standard bash terminal won't allows for debugging).

From the directory `./le-taxi-api-tests`:

To use the right node version `nvm use`

> this is required because the ui required an old node version, but the remaining part of the code base is up to date.

To install, run `npm install`.

To Execute, run `npm run all-tests-localhost`.

Note: The Node.js API must be running to execute the API tests.

### Load Tests

The load tests allow us to validate that we can support the expected load on the two most critical functions of the Registry, that is positions ingest and taxi search.

Note: The Node.js API must be running to execute the load tests.

Open a standard bash terminal

From the directory `./le-taxi-api-tests`:

To use the right node version `nvm use`

> this is required because the ui required an old node version, but the remaining part of the code base is up to date.

To install, run `npm install`.

#### Initialize the .sharedState.json files (only once for new local database)

In order to run the load tests, some taxis must be generated in advance. You can do so by running `npm run generate-load-test-shared-state-localhost`.
Note that this process can take several minutes. Once done, you will be able to run the load tests at will.

#### For the taxi positions ingest

To run the load tests for the taxi position ingest, run:

- `npm run load-test-position-snapshots-localhost` to simulate 600 000 positions in 5 minutes.

#### For the taxi search

In order to run the load tests for the taxi search, you should run the taxi position ingest first so that taxi are available during the test, then:

- `npm run load-test-realtime-booking-localhost` to simulate 24 000 requêtes in 5 minutes.

### User interface

> **Note:** The core of the taxi registry is the API-to-API integration between taxi operators, search engines, and the registry. The UI is an administration interface that helps registry admins manage the system — it is not the primary product.

Note: The Node.js API must be running to execute the user interface.

Open a standard bash terminal (javascript debug terminal is not usefull for the ui, use brower debugging tool instead. Moreover, javascript debug terminal won't work with this old node.js version).

From the directory `./le-taxi-angular-ui`:

To use the right node version `nvm use`

> this is required because the ui required an old node version, but the remaining part of the code base is up to date.

To install, run `npm install`.

To execute, run `npm run serve`.

Navigate to http://localhost:4200/

> - Username: admin
> - Password: admin

The local database has been initialized with one admin account with the username and password above. Once the UI is running, you will be able to log in with the admin account. From there, you can navigate to the user `Utilisateurs` page and you will be able to create new users and generate new passwords and API keys.

It should not be necessary, but if you need to create an admin account in an empty database, you can tweak the script [Postgres 1.0.7](../le-taxi-api-node.js/src/databaseMigrations/postgres/afterSemver/pg_1_0_7_set_admin_password.ts). The password must be encrypted with the secret listed in the API Node.js configuration file (see the [encrypt function](../le-taxi-api-node.js/src/libs/security.ts) for the required format).

> Hint: to see taxi moving on the map, launch the "taxi positions ingest" load test and use the UI to visualize the taxi positions on the map.

## Limitations

### Multiple versions of node to support the UI

Using nvm is a bit tedious, but it works. Just remember to run nvm use, or your npm commands will fail. This was the quickest setup for the dev container given the tight schedule. Feel free to optimize it.

### Database Migrations

Importing the backup is a simple way to bootstrap the local environment. However, any database changes made after the backup snapshot will need to be applied manually. There is no automated migration system (e.g., [Liquibase](https://www.liquibase.com/)). All database changes are scripted in the [database migration folder](https://github.com/VilledeMontreal/montreal-taxi-registry/tree/develop/le-taxi-api-node.js/src/databaseMigrations), but these scripts are run manually.

### Triple Deployment Architecture

The taxi registry uses a triple deployment model to ensure service-level isolation. See the multiple Jenkinsfile under [montreal-taxi-registry/le-taxi-api-node.js](https://github.com/VilledeMontreal/montreal-taxi-registry/tree/develop/le-taxi-api-node.js). This architecture was introduced after a data export from a partner caused a full registry outage. The three deployments isolate workloads so that a heavy operation in one context cannot impact the availability of the others.

This complexity is not useful in localhost, thus all endpoints are served directly from the dev container without service-level isolation.
