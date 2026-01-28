// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { getGofsDeepLinks } from "./gofsDeepLinks.apiClient";

export async function invalidGofsDeepLinksTests(): Promise<void> {
  testGofsDeepLinksAccessInvalid(UserRole.Admin);
  testGofsDeepLinksAccessInvalid(UserRole.Motor);
  testGofsDeepLinksAccessInvalid(UserRole.Inspector);
  testGofsDeepLinksAccessInvalid(UserRole.Manager);
  testGofsDeepLinksAccessInvalid(UserRole.Stats);
  testGofsDeepLinksAccessInvalid(UserRole.Prefecture);
}

function testGofsDeepLinksAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access the Gofs deep link acceptance test page`, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () => getGofsDeepLinks(apiKey),
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
