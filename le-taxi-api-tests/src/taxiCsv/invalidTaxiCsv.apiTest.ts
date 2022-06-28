// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getTaxiCsv } from './taxiCsv.apiClient';

export async function invalidTaxiCsvTests(): Promise<void> {
  testTaxiCsvAccessInvalid(UserRole.Stats);
  testTaxiCsvAccessInvalid(UserRole.Motor);
  testTaxiCsvAccessInvalid(UserRole.Prefecture);
  testTaxiCsvAccessInvalid(UserRole.Operator);
}

function testTaxiCsvAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access taxi CSV file `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => getTaxiCsv(operator.email, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          'The user has a role which has insufficient permissions to access this resource.'
        );
      }
    );
  });
}
