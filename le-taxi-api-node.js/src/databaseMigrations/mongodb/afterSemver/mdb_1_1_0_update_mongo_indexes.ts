// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { connectToMongoDb } from "../../../features/shared/taxiMongo/taxiMongo";

export async function mdb_1_1_0_update_mongo_indexes(): Promise<void> {
  const db = await connectToMongoDb();

  // Drop all previous indexes
  await db.collection("latestTaxiPositions").dropIndexes();

  // Create expiration index with TTL
  await db
    .collection("latestTaxiPositions")
    .createIndex(
      { receivedAt: 1 },
      { name: "expiration", expireAfterSeconds: 120 },
    );

  // Create location index for standard taxis
  await db.collection("latestTaxiPositions").createIndex(
    { location: "2dsphere" },
    {
      name: "locationStandard",
      partialFilterExpression: { "taxi.isSpecialNeedVehicle": false },
    },
  );

  // Create location index for minivans taxis
  await db.collection("latestTaxiPositions").createIndex(
    { location: "2dsphere" },
    {
      name: "locationMinivan",
      partialFilterExpression: {
        "taxi.isMpv": true,
        "taxi.isSpecialNeedVehicle": false,
      },
    },
  );

  // Create location index for special need taxis
  await db.collection("latestTaxiPositions").createIndex(
    { location: "2dsphere" },
    {
      name: "locationSpecialNeed",
      partialFilterExpression: { "taxi.isSpecialNeedVehicle": true },
    },
  );
}
