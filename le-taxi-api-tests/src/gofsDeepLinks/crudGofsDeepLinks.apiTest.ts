// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { getGofsDeepLinks } from "./gofsDeepLinks.apiClient";

export async function crudGofsDeepLinksTests(): Promise<void> {
  testGofsDeepLinksAccessValid(UserRole.Operator);
}

function testGofsDeepLinksAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access the Gofs deep link acceptance test page`, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    const response = await getGofsDeepLinks(apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
  });
}
