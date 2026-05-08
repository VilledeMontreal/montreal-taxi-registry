# Running the Taxi Registry Locally

## Prerequisites

In addition to the Dev Container prerequisites (see [Using a Dev Container](using-dev-container.md)), install the following tools on your **host machine**:

1. [DBeaver](https://dbeaver.io/download/) — PostgreSQL client
2. [MongoDB Compass](https://www.mongodb.com/try/download/compass) — MongoDB GUI
3. [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) — includes `mongorestore` CLI

---

## Setup Steps

### 1. Start the Dev Container

Follow the [Using a Dev Container](Utiliser%20un%20dev%20container.md TBD) guide to clone and open [montreal-taxi-registry](https://github.com/VilledeMontreal/montreal-taxi-registry) in a Dev Container.

The Dev Container starts local instances of **PostgreSQL**, **MongoDB**, and **OSRM**.

> **Note:** The first launch is slow because it downloads the PostgreSQL, MongoDB, and OSRM images. Subsequent launches are fast.

### 2. Restore the PostgreSQL Database

Download the PostgreSQL backup from the [montreal-taxi-registry](https://github.com/VilledeMontreal/montreal-taxi-registry) repository (link to backup TBD).

Run the restore using `pg_restore` (example using the DBeaver-bundled binary on Windows) with this PowerShell command:

```powershell
& "C:\Users\<your-user>\AppData\Roaming\DBeaverData\drivers\clients\postgresql\win\17\pg_restore.exe" `
  --verbose --host=localhost --port=5432 `
  --username=vdm_txp `
  --dbname=vdm_txp `
  --format=c `
  --no-owner `
  --no-privileges `
  "C:\path\to\TBD.sql"
```

> **Expected 2 warnings (safe to ignore):**
>
> The restore should complete with: `pg_restore: warning: errors ignored on restore: 2`
>
> - `unrecognized configuration parameter "transaction_timeout"` — The DBeaver-bundled `pg_restore` version is newer than the `postgis/postgis:15-3.5` Docker image.
> - `schema "public" already exists` — PostGIS is pre-installed in the `public` schema on the `postgis/postgis:15-3.5` image.

### 3. Verify the PostgreSQL Database

Import the local database connection into DBeaver (connection import file TBD) and connect to verify the data was restored correctly.

### 4. Restore the MongoDB Database

Download the MongoDB backup from the [montreal-taxi-registry](https://github.com/VilledeMontreal/montreal-taxi-registry) repository (link to backup TBD).

TBD: use path\to\mongo\dir
Copy the backup into the `backup_schema` folder under the `tools` directory, then run:

```bash
cd tools
mongorestore --uri="mongodb://vdm_txp:vdm_txp@localhost:27017/?authSource=admin" --nsInclude="vdm_txp.*" ./backup_schema
```

> **Important:** The `authSource=admin` parameter is required. Without it, authentication will fail against the local MongoDB instance.

### 5. Verify the MongoDB Database

Import the local database connection into MongoDB Compass (connection import file TBD) and connect to verify the data was restored correctly.

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
