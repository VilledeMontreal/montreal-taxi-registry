// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import {
  getCurrentTaxiPositionTimestamp,
  getTaxiPositionSnapshotDataDump,
} from "./taxiPositionSnapshotDataDumps.apiClient";

export async function invalidTaxiPositionSnapshotDataDumpsTests(): Promise<void> {
  testTaxiPositionSnapshotDataDumpsAccessInvalid(UserRole.Operator);
  testTaxiPositionSnapshotDataDumpsAccessInvalid(UserRole.Inspector);
  testTaxiPositionSnapshotDataDumpsAccessInvalid(UserRole.Motor);
  testTaxiPositionSnapshotDataDumpsAccessInvalid(UserRole.Prefecture);

  it("Should return 400 bad request when querying minutes not % 10", async () => {
    const currentTimestamp = new Date(getCurrentTaxiPositionTimestamp());
    const timestampWrongMinute = new Date(
      currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 1),
    );

    await shouldThrow(
      () => getTaxiPositionSnapshotDataDump(timestampWrongMinute.toISOString()),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, "Invalid date.");
      },
    );
  });

  it("Should return 400 bad request when querying seconds not equal to 0", async () => {
    const currentTimestamp = new Date(getCurrentTaxiPositionTimestamp());
    const timestampWrongSecond = new Date(
      currentTimestamp.setSeconds(currentTimestamp.getSeconds() + 1),
    );

    await shouldThrow(
      () => getTaxiPositionSnapshotDataDump(timestampWrongSecond.toISOString()),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, "Invalid date.");
      },
    );
  });

  it("Should return 400 bad request when no time provided", async () => {
    await shouldThrow(
      () => getTaxiPositionSnapshotDataDump(""),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, "Invalid date.");
      },
    );
  });
}

function testTaxiPositionSnapshotDataDumpsAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access taxi positions snapshots data dumps `, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () =>
        getTaxiPositionSnapshotDataDump(
          getCurrentTaxiPositionTimestamp(),
          apiKey,
        ),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          "The user has a role which has insufficient permissions to access this resource.",
        );
      },
    );
  });
}
