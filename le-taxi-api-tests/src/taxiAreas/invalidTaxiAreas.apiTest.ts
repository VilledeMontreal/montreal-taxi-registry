// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../shared/commonTests/UserRole";
import {
  getImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import { getTaxiAreas } from "./taxiAreas.apiClient";

export async function invalidTaxiAreasTests(): Promise<void> {
  testTaxiAreasAccessInvalid(UserRole.Operator);
  testTaxiAreasAccessInvalid(UserRole.Stats);
  testTaxiAreasAccessInvalid(UserRole.Motor);
  testTaxiAreasAccessInvalid(UserRole.Prefecture);
}

function testTaxiAreasAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access taxi areas `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => getTaxiAreas(operator.email, apiKey),
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
