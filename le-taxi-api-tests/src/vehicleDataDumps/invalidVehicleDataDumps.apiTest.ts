// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { createNonImmutableUser, getImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getVehicleDataDump } from './vehicleDataDumps.apiClient';

// tslint:disable-next-line: max-func-body-length
export async function invalidVehicleDataDumpsTests(): Promise<void> {
  testVehicleDataDumpsAccessInvalid(UserRole.Operator);
  testVehicleDataDumpsAccessInvalid(UserRole.Inspector);
  testVehicleDataDumpsAccessInvalid(UserRole.Motor);
  testVehicleDataDumpsAccessInvalid(UserRole.Prefecture);

  it('Returns error no new data on vehicle data dump', async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);

    const dataDumpResponse = await getVehicleDataDump(newOperator.email);
    assert.strictEqual(dataDumpResponse.status, StatusCodes.OK);

    await shouldThrow(
      () => getVehicleDataDump(newOperator.email, null, dataDumpResponse.get('etag')),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_MODIFIED);
      }
    );
  });
}

function testVehicleDataDumpsAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access vehicle data dumps`, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => getVehicleDataDump(operator.email, apiKey),
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
