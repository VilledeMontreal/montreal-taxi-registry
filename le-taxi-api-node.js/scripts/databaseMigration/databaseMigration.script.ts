// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { CaporalValidator, Command } from '@caporal/core';
import { ScriptBase } from '@villedemontreal/scripting/dist/src/scriptBase';
import { DatabaseType, IMigrationArguments } from './databaseMigration.types';
import { migrationsByDatabaseTypeAndVersion } from './migrations';

export class MigrateScript extends ScriptBase<IMigrationArguments> {
  get name(): string {
    return 'migrate';
  }

  get description(): string {
    return `Launch the migration scripts

    Ex: ./run migrate postgresql 1.0.0`;
  }

  protected async configure(command: Command): Promise<void> {
    command.argument('<databaseType>', `${DatabaseType.mongodb} or ${DatabaseType.postgresql}`);
    command.argument('<databaseVersion>', 'semver like 1.0.0');
    command.argument('[options]', 'additionnal options', {
      validator: CaporalValidator.STRING
    });
  }

  protected async main() {
    const { databaseType, databaseVersion, options } = this.args as IMigrationArguments;

    this.logger.info(`DatabaseType: ${databaseType}`);
    this.logger.info(`DatabaseVersion: ${databaseVersion}`);
    this.logger.info(`options: ${options}`);

    await this.executeMigration(databaseType, databaseVersion, options);
  }

  protected async executeMigration(databaseType: DatabaseType, databaseVersion: string, options: string) {
    if (!Object.values(DatabaseType).includes(databaseType)) {
      throw new Error(`The database type: ${databaseType} is invalid`);
    }

    if (!Object.keys(migrationsByDatabaseTypeAndVersion[databaseType]).includes(databaseVersion)) {
      throw new Error(`The database type: ${databaseType} version: ${databaseVersion} is invalid`);
    }

    const databaseTypeMigrations = migrationsByDatabaseTypeAndVersion[databaseType];
    const migrationScript = databaseTypeMigrations[databaseVersion];

    try {
      await migrationScript(options);
      this.logger.info(`Migration script completed with success.`);
    } catch (error) {
      this.logger.debug(error);
      throw new Error(`Error executing migration script: ${error}`);
    }
  }
}
