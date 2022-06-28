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
