// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { getGtfsDeepLinks } from "./gtfsDeepLinks.apiClient";

// eslint-disable-next-line max-lines-per-function
export async function invalidGtfsDeepLinksTests(): Promise<void> {
  testGtfsDeepLinksAccessInvalid(UserRole.Admin);
  testGtfsDeepLinksAccessInvalid(UserRole.Motor);
  testGtfsDeepLinksAccessInvalid(UserRole.Inspector);
  testGtfsDeepLinksAccessInvalid(UserRole.Manager);
  testGtfsDeepLinksAccessInvalid(UserRole.Stats);
  testGtfsDeepLinksAccessInvalid(UserRole.Prefecture);
}

function testGtfsDeepLinksAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access the Gtfs deep link acceptance test page`, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () => getGtfsDeepLinks(apiKey),
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
