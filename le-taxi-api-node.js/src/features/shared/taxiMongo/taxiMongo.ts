// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import assert from "assert";
import { Db, MongoClient } from "mongodb";
import { configs } from "../../../config/configs";

let db: Db;

let client: MongoClient;

export async function connectToMongoDb() {
  client = await MongoClient.connect(buildMongoConnectionString(), {
    maxPoolSize: configs.dataSources.mongo.poolSize,
  });
  db = client.db("vdm_txp");
  return db;
}

function buildMongoConnectionString(): string {
  const {
    host1,
    host2,
    host3,
    port,
    username,
    password,
    defaultauthdb,
    options,
  } = configs.dataSources.mongo;
  return `mongodb://${username}:${password}@${host1}:${port},${host2}:${port},${host3}:${port}/${defaultauthdb}?${options}`;
}

export function getMongoDb() {
  assert.ok(
    db,
    `no instance of db mongo. Does connectToMongoDb() have been called ??`,
  );
  return db;
}
