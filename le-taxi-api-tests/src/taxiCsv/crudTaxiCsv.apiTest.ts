// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../shared/commonTests/UserRole';
import { setupNewTaxi } from '../taxis/taxi.fixture';
import { copyTaxiTemplate } from '../taxis/taxisDto.template';
import { createNonImmutableUser, getImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getTaxiCsv } from './taxiCsv.apiClient';

const expectedColumnNames = [
  'ADDED_AT',
  'SOURCE',
  'LAST_UPDATE_AT',
  'ID',
  'ADDED_BY',
  'RATING',
  'BAN_BEGIN',
  'BAN_END',
  'PRIVATE',
  'NUMERO',
  'DOUBLAGE',
  'ADS_ADDED_AT',
  'ADS_ADDED_BY',
  'ADS_LAST_UPDATE_AT',
  'INSEE',
  'CATEGORY',
  'OWNER_NAME',
  'OWNER_TYPE',
  'VDM_VIGNETTE',
  'LICENCE_PLATE',
  'FIRST_NAME',
  'LAST_NAME',
  'PROFESSIONAL_LICENCE',
  'ADDED_BY_NAME'
];

export async function crudTaxiCsvTests(): Promise<void> {
  testTaxiCsvAccessValid(UserRole.Admin);
  testTaxiCsvAccessValid(UserRole.Manager);
  testTaxiCsvAccessValid(UserRole.Inspector);

  it('Taxi CSV file conforms to all columns name and position', async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator, true);
    await setupNewTaxi(copyTaxiTemplate(), newOperator.apikey);

    const apiKey = await getImmutableUserApiKey(UserRole.Manager);
    const responseCsv = await getTaxiCsv(newOperator.email, apiKey);
    assert.strictEqual(responseCsv.status, StatusCodes.OK);
    const responseLines = responseCsv.text.split('\r\n');
    const responseColumnNames = responseLines[0].split(';');
    if (responseColumnNames[responseColumnNames.length - 1] === '') {
      responseColumnNames.pop();
    }

    assert.isTrue(areColumnNamesIdentical(expectedColumnNames, responseColumnNames));
  });
}

function testTaxiCsvAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access taxi CSV file `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getTaxiCsv(operator.email, apiKey);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}

function areColumnNamesIdentical(a: string[], b: string[]): boolean {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}
