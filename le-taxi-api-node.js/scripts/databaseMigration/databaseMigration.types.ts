// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export enum DatabaseType {
  postgresql = 'postgresql',
  mongodb = 'mongodb'
}

export interface IMigrationArguments {
  databaseType: DatabaseType;
  databaseVersion: string;
  options: string;
}

export type DatabaseMigration = (options?: string) => Promise<void>;
