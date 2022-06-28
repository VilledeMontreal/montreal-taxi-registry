# Database migration

Launch the script `Debug migration script` from the launch.json.

Or run the command in the terminal:
```powershell
> .\run migrate <databaseType> => mongodb  <databaseVersion> => 1.0.0
```

## Adding a migration script

To create a migration script copy and rename the file: `postgresql-migration-script-1.0.0.ts` to fit your need.

Migration script must respect [semver](https://semver.org/).


The migration of database use [node-scripting](https://github.com/VilledeMontreal/node-scripting)