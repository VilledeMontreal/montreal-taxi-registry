# Running the Taxi Registry Locally

## Prerequisites

In addition to the Dev Container prerequisites (see [Using a Dev Container](using-dev-container.md)), install the following tools on your **host machine**:

1. [DBeaver](https://dbeaver.io/download/) — PostgreSQL client
2. [MongoDB Compass](https://www.mongodb.com/try/download/compass) — MongoDB GUI
3. [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) — includes `mongorestore` CLI
4. Download backups-to-init-dev-container.zip

I have missed time to properly automate database setup. Please contact the taxi registry team to download the file **backups-to-init-dev-container.zip** required to setup databases locally, the extract it locally. In the rest of the document, $backups-to-init-dev-container refers to the location the zip was extracted.

## Setup Steps

### 1. Start the Dev Container

Follow the [Using a Dev Container](using-dev-container.md) guide to clone and open [montreal-taxi-registry](https://github.com/VilledeMontreal/montreal-taxi-registry) in a Dev Container.

The Dev Container starts local instances of **PostgreSQL**, **MongoDB**, and **OSRM**.

> **Note:** The first launch is slow because it downloads the PostgreSQL, MongoDB, and OSRM images. Subsequent launches are fast.

### 2. Restore the PostgreSQL Database

Run the restore using `pg_restore` (example using the DBeaver-bundled binary on Windows) with this PowerShell command:

If pg_restore is not recognize as a global command

```powershell
cd C:\Users\<your-user>\AppData\Roaming\DBeaverData\drivers\clients\postgresql\win\17\
```

```powershell
& ".\pg_restore.exe" --verbose --host=localhost --port=5432 --username=vdm_txp --dbname=vdm_txp --format=c --no-owner --no-privileges   "$backups-to-init-dev-container\postgre\taxi-registry-local-db.sql"
```

> password: vdm_txp

> **Expected 2 warnings (safe to ignore):**
>
> The restore should complete with: `pg_restore: warning: errors ignored on restore: 2`
>
> - `unrecognized configuration parameter "transaction_timeout"` — The DBeaver-bundled `pg_restore` version is newer than the `postgis/postgis:15-3.5` Docker image.
> - `schema "public" already exists` — PostGIS is pre-installed in the `public` schema on the `postgis/postgis:15-3.5` image.

### 3. Verify the PostgreSQL Database

Connect to the postgre database using DBeaver and connect to verify the database was restored correctly.
host: localhost
port: 5432
database: vdm_txp
username: vdm_txp
password: vdm_txp

### 4. Restore the MongoDB Database

If mongorestore is not recognize as a global command

```powershell
cd C:\path-where-you-downloaded-mongorestore
```

```powershell
mongorestore --uri="mongodb://vdm_txp:vdm_txp@localhost:27020/?authSource=admin" --nsInclude="vdm_txp.*" $backups-to-init-dev-container\mongo\backup_schema
```

> **Important:** The `authSource=admin` parameter is required. Without it, authentication will fail against the local MongoDB instance.

### 5. Verify the MongoDB Database

Connect to the mongo database using MongoDB Compass and connect to verify the collection was restored correctly.

Connection string: mongodb://vdm_txp:vdm_txp@127.0.0.1:27020/?authSource=admin

> The standard port 27017 is used inside the container, but 27020 is used from outside of the container to prevent port clash with other mongo installation.

### 6. Building and Running the Application

The codebase is pre-configured for local execution. Build and run the Api Node.js, then run the API Tests to make sure your the setup is completed.

## Building and Running the Application

### Api Node.js

From the directory `./le-taxi-api-node.js`:

To install, run `npm install`.

To execute, run `npm run start-localhost`.

### API Tests

Technologies: Node.js, Vitest, Chai, TypeScript

The behavior of the taxi registry is mainly checked using API tests. These tests are using the [@villedemontreal/concurrent-api-tests](https://github.com/VilledeMontreal/concurrent-api-tests) library and the approach described in [Concurrent API Tests](https://github.com/VilledeMontreal/concurrent-api-tests), in order to have reliable, maintainable and fast tests to run.

From the directory `./le-taxi-api-tests`:

To install, run `npm install`.

To Execute, run `npm run all-tests-localhost`.

Note: The Node.js API must be running to execute the API tests.

### Load Tests

Technologies: Node.js, Artillery, TypeScript

The load tests allows us to validate that we can support the expected load on the two most critical functions of the Registry, that is positions ingest and taxi search.

From the directory `./le-taxi-api-tests`:

To install, run `npm install`.

#### For the taxi positions ingest

In order to run the load tests, some taxis must be generated in advance. You can do so by running `npm run load-test-position-snapshots-generate-shared-state`.
Note that this process can take several minutes. Once done, you will be able to run the load tests at will.

To run the load tests for the taxi position ingest, run:

- `npm run load-test-position-snapshots-with-25-operators-200-taxis` to simulate 300 000 positions in 5 minutes.
- `npm run load-test-position-snapshots-with-50-operators-200-taxis` to simulate 600 000 positions in 5 minutes.

#### For the taxi search

First run `npm run load-test-generate-shared-state` to prepare to run tests.

In order to run the load tests for the taxi search, you should run the taxi position ingest first so that taxi are available during the test, then:

- `npm run load-test-300-inquiry` to simulate 300 requêtes in 5 minutes.
- `npm run load-test-1200-inquiry` to simulate 1200 requêtes in 5 minutes.

Note: The Node.js API must be running to execute the load tests.

### User interface

> **Note:** The core of the taxi registry is the API-to-API integration between taxi operators, search engines, and the registry. The UI is an administration interface that helps registry admins manage the system — it is not the primary product.

> **Important:** The UI can only run with Node.js version 10.15. In the terminal windows, use the arrow at the right of the plus icon, in the drop down list there will be a preconfigured terminal launcher named "UI Taxi Registry (Node 10)". This will launch a terminal with a yellow icon, from there you can launch the following commands:

Note: The Node.js API must be running to execute the user interface.

From the directory `./le-taxi-angular-ui`:

To install, run `npm install`.

To execute, run `npm run serve`.

Navigate to http://localhost:4200/

> Username: admin
> Password: admin

The local database has been initialized with one admin account with the username and password above. Once the UI is running, you will be able to log in with the admin account. From there, you can navigate to the user `Utilisateurs` page and you will be able to create new users and generate new passwords and apikeys.

It should not be necessary, but if you need to create an admin account in an empty database, you can tweak the script [Postgres 1.0.7](./le-taxi-api-node.js/src/databaseMigrations/postgres/afterSemver/pg_1_0_7_set_admin_password.ts). The password must be encrypted with the secret listed in the API Node.js configuration file (see the [encrypt function](./le-taxi-api-node.js/src/libs/security.ts) for the required format).

### Integration Tests (legacy)

Technologies: Node.js, Vitest, Chai, TypeScript

Unit tests allow us to validate the behavior of a few functions that would otherwise be difficult to test using the API; such as caches of date utils functions.

From the directory `./le-taxi-api-tests`:

Run the creation of a shared state file then follow the instructions: `npm run generate-integration-tests-shared-state`.

Once the file copied, you will be able to run the unit tests at will.

Then, from the directory `./le-taxi-api-node.js`:

To execute, run `npm run test-localhost`.

## Limitations

### Database Migrations

Importing the backup is a simple way to bootstrap the local environment. However, any database changes made after the backup snapshot will need to be applied manually. There is no automated migration system (e.g., [Liquibase](https://www.liquibase.com/)). All database changes are scripted in the [database migration folder](https://github.com/VilledeMontreal/montreal-taxi-registry/tree/develop/le-taxi-api-node.js/src/databaseMigrations), but these scripts are run manually.

### Triple Deployment Architecture

The taxi registry uses a triple deployment model to ensure service-level isolation. See the multiple Jenkinsfile under [montreal-taxi-registry/le-taxi-api-node.js](https://github.com/VilledeMontreal/montreal-taxi-registry/tree/develop/le-taxi-api-node.js). This architecture was introduced after a data export from a partner caused a full registry outage. The three deployments isolate workloads so that a heavy operation in one context cannot impact the availability of the others.

This complexity is not useful in localhost, thus all endpoints are served directely from the dev container without service-level isolation.
