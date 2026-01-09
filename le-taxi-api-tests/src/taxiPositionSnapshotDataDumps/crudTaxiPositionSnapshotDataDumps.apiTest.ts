// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import { createTaxiWithStatus } from "../taxiPositionSnapShots/taxiPositionSnapshots.fixture";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import {
  getCurrentTaxiPositionTimestamp,
  getTaxiPositionSnapshotDataDump,
} from "./taxiPositionSnapshotDataDumps.apiClient";

export async function crudTaxiPositionSnapshotDataDumpsTests(): Promise<void> {
  testTaxiPositionSnapshotDataDumpsAccessValid(UserRole.Admin);
  testTaxiPositionSnapshotDataDumpsAccessValid(UserRole.Manager);
  testTaxiPositionSnapshotDataDumpsAccessValid(UserRole.Stats);

  it("Should be able to retrieve taxi positions snapshots for taxis with status free", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const taxiResponse = await createTaxiWithStatus("free", apiKey);
    assert.strictEqual(taxiResponse.status, StatusCodes.CREATED);

    const responseDataDump = await getTaxiPositionSnapshotDataDump(
      getCurrentTaxiPositionTimestamp(),
    );
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);

    const taxiId = taxiResponse.body.data[0].id;
    const found = responseDataDump.body.items.some((snapshot: any) =>
      snapshot.items.some((position: any) => position.taxi === taxiId),
    );

    assert.strictEqual(found, true);
  });

  it("Should not return taxis with status off from taxi positions snapshots", async () => {
    const apiKey = await getImmutableUserApiKey(UserRole.Operator);
    const taxiResponse = await createTaxiWithStatus("off", apiKey);
    assert.strictEqual(taxiResponse.status, StatusCodes.CREATED);

    const responseDataDump = await getTaxiPositionSnapshotDataDump(
      getCurrentTaxiPositionTimestamp(),
    );
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);

    const taxiId = taxiResponse.body.data[0].id;
    const found = responseDataDump.body.items.some((snapshot: any) =>
      snapshot.items.some((position: any) => position.taxi === taxiId),
    );

    assert.strictEqual(found, false);
  });
}

function testTaxiPositionSnapshotDataDumpsAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access taxi positions snapshots data dumps `, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getTaxiPositionSnapshotDataDump(
      getCurrentTaxiPositionTimestamp(),
      apiKey,
    );
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}
