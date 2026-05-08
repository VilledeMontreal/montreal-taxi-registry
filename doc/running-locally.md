# Running the Taxi Registry Locally

## Prerequisites

In addition to the Dev Container prerequisites (see [Using a Dev Container](using-dev-container.md)), install the following tools on your **host machine**:

1. [DBeaver](https://dbeaver.io/download/) — PostgreSQL client
2. [MongoDB Compass](https://www.mongodb.com/try/download/compass) — MongoDB GUI
3. [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) — includes `mongorestore` CLI
4. Download backups-to-init-dev-container.zip

I have missed time to properly automate database setup. Please contact the taxi registry team to download the file **backups-to-init-dev-container.zip** required to setup databases locally, the extract it locally. In the rest of the document, $backups-to-init-dev-container refers to the location the zip was extracted.

---

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

### 6. Run the Application

The codebase is pre-configured for local execution. Use the following VS Code build commands in order:

1. **Start API [localhost]** — Start the API server first.
2. **Start API Tests [localhost]** — Run the API integration tests.
3. **Start UI [localhost]** — Launch the admin UI.

> **Note:** The core of the taxi registry is the API-to-API integration between taxi operators, search engines, and the registry. The UI is an administration interface that helps registry admins manage the system — it is not the primary product.

---

## Limitations

### Database Migrations

Importing the backup is a simple way to bootstrap the local environment. However, any database changes made after the backup snapshot will need to be applied manually. There is no automated migration system (e.g., [Liquibase](https://www.liquibase.com/)). All database changes are scripted in the [database migration folder](https://github.com/VilledeMontreal/montreal-taxi-registry/tree/develop/le-taxi-api-node.js/src/databaseMigrations), but these scripts are run manually.

### Triple Deployment Architecture

The taxi registry uses a triple deployment model to ensure service-level isolation. See the multiple Jenkinsfile under [montreal-taxi-registry/le-taxi-api-node.js](https://github.com/VilledeMontreal/montreal-taxi-registry/tree/develop/le-taxi-api-node.js). This architecture was introduced after a data export from a partner caused a full registry outage. The three deployments isolate workloads so that a heavy operation in one context cannot impact the availability of the others.

This complexity is not useful in localhost, thus all endpoints are served directely from the dev container without service-level isolation.
