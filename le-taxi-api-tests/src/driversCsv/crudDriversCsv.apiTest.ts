// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createDriver } from '../drivers/driver.apiClient';
import { UserRole } from '../shared/commonTests/UserRole';
import { createNonImmutableUser, getImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getDriversCsv } from './driversCsv.apiClient';

const expectedColumnNames = [
  'ADDED_AT',
  'ADDED_VIA',
  'SOURCE',
  'LAST_UPDATE_AT',
  'ID',
  'ADDED_BY',
  'FIRST_NAME',
  'LAST_NAME',
  'PROFESSIONAL_LICENCE',
  'ADDED_BY_NAME'
];

export async function crudDriversCsvTests(): Promise<void> {
  testDriversCsvAccessValid(UserRole.Admin);
  testDriversCsvAccessValid(UserRole.Manager);
  testDriversCsvAccessValid(UserRole.Inspector);

  it('Drivers CSV file conforms to all columns name and position', async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    await createDriver(newOperator.apikey);

    const apiKey = await getImmutableUserApiKey(UserRole.Manager);
    const responseCsv = await getDriversCsv(newOperator.email, apiKey);
    assert.strictEqual(responseCsv.status, StatusCodes.OK);
    const responseLines = responseCsv.text.split('\r\n');
    const responseColumnNames = responseLines[0].split(';');
    if (responseColumnNames[responseColumnNames.length - 1] === '') {
      responseColumnNames.pop();
    }

    assert.isTrue(areColumnNamesIdentical(expectedColumnNames, responseColumnNames));
  });
}

function testDriversCsvAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access Drivers CSV file`, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getDriversCsv(operator.email, apiKey);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}

function areColumnNamesIdentical(a: string[], b: string[]): boolean {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}
