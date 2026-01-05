// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import {
  getImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import { getTaxiAreas } from "./taxiAreas.apiClient";

// eslint-disable-next-line max-lines-per-function
export async function crudTaxiAreasTests(): Promise<void> {
  testTaxiAreasAccessValid(UserRole.Inspector);
  testTaxiAreasAccessValid(UserRole.Admin);
  testTaxiAreasAccessValid(UserRole.Manager);
}

function testTaxiAreasAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access taxi areas `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getTaxiAreas(operator.email, apiKey);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}
