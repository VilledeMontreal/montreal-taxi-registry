// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import {
  getImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import { getRoleDataDump } from "./roleDataDumps.apiClient";

// eslint-disable-next-line max-lines-per-function
export async function crudRoleDataDumpsTests(): Promise<void> {
  testRoleDataDumpsAccessValid(UserRole.Stats);
  testRoleDataDumpsAccessValid(UserRole.Admin);
  testRoleDataDumpsAccessValid(UserRole.Manager);
}

function testRoleDataDumpsAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access role data dumps `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getRoleDataDump(operator.email, apiKey);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}
