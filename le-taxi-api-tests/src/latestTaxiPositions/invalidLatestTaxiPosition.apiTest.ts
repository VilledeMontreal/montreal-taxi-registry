// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { getLatestTaxiPositions } from "./latestTaxiPosition.apiClient";

// eslint-disable-next-line max-lines-per-function
export async function invalidLatestTaxiPositionTests(): Promise<void> {
  testLatestTaxiPositionsAccessInvalid(UserRole.Motor);
  testLatestTaxiPositionsAccessInvalid(UserRole.Operator);
  testLatestTaxiPositionsAccessInvalid(UserRole.Prefecture);
  testLatestTaxiPositionsAccessInvalid(UserRole.Stats);
}

function testLatestTaxiPositionsAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access LatestTaxiPositions`, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => getLatestTaxiPositions(apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          "The user has a role which has insufficient permissions to access this resource."
        );
      }
    );
  });
}
