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
import { getRoleDataDump } from "./roleDataDumps.apiClient";

// eslint-disable-next-line max-lines-per-function
export async function invalidRoleDataDumpsTests(): Promise<void> {
  testRoleDataDumpsAccessInvalid(UserRole.Operator);
  testRoleDataDumpsAccessInvalid(UserRole.Inspector);
  testRoleDataDumpsAccessInvalid(UserRole.Motor);
  testRoleDataDumpsAccessInvalid(UserRole.Prefecture);
}

function testRoleDataDumpsAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access role data dumps `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => getRoleDataDump(operator.email, apiKey),
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
