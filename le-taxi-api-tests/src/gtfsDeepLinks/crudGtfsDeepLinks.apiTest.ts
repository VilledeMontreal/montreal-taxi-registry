// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";
import { getGtfsDeepLinks } from "./gtfsDeepLinks.apiClient";

// eslint-disable-next-line max-lines-per-function
export async function crudGtfsDeepLinksTests(): Promise<void> {
  testGtfsDeepLinksAccessValid(UserRole.Operator);
}

function testGtfsDeepLinksAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access the Gtfs deep link acceptance test page`, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    const response = await getGtfsDeepLinks(apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
  });
}
