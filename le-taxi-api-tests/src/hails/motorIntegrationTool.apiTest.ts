// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { ITaxiResponseDto } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getHail, postHail } from './hail.apiClient';
import { StatusHail } from './hail.enum';
import { motorUpdatesHailStatus } from './hail.fixture';
import { copyHailTemplate } from './hailDto.template';
import { taxiSearchIntegrationTool } from './integrationTools.apiClient';

// tslint:disable-next-line:max-func-body-length
export async function motorIntegrationToolTests(): Promise<void> {
  it('Search closest taxi via the motor integration tools should return one taxi per test scenario', async () => {
    const actual = await taxiSearchIntegrationTool();

    assertContainsTestCase(actual.body.data, 'accepted_by_customer_after_timeout');
    assertContainsTestCase(actual.body.data, 'accepted_by_taxi_after_timeout22222');
    assertContainsTestCase(actual.body.data, 'canceled_by_customer');
    assertContainsTestCase(actual.body.data, 'canceled_by_taxi_after_accepted_by_customer');
    assertContainsTestCase(actual.body.data, 'canceled_by_taxi_before_accepted_by_customer');
    assertContainsTestCase(actual.body.data, 'declined_by_customer');
    assertContainsTestCase(actual.body.data, 'failure_example');
    assertContainsTestCase(actual.body.data, 'happy_path');
    assertContainsTestCase(actual.body.data, 'not_accepted_by_taxi');
    assert.strictEqual(actual.body.data.length, 11);
  });

  it('Search closest taxi via the motor integration tools should return different taxis each time', async () => {
    const firstClosestTaxi = await taxiSearchIntegrationTool();
    const secondClosestTaxi = await taxiSearchIntegrationTool();

    assert.isFalse(doTaxisIncludesTaxiId(secondClosestTaxi.body.data, firstClosestTaxi.body.data[0].id));
  });

  it('Hail happy path via the motor integration tools should work', async () => {
    const searchResults = await taxiSearchIntegrationTool();
    const happyPathTaxi = getTaxiFromTestCase(searchResults.body.data, 'happy_path');
    const hailDto = copyHailTemplate(x => (x.data[0].taxi_id = happyPathTaxi.id));

    const postHailResponse = await postHail(hailDto);
    assert.strictEqual(postHailResponse.status, StatusCodes.CREATED);
    assert.strictEqual(postHailResponse.body.data[0].status, StatusHail.RECEIVED);

    await aFewSeconds(15); // wait until reach the status accepted by taxi
    const hailId = await postHailResponse.body.data[0].id;
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);

    await aFewSeconds(35); // wait until reach the status finished
    const getFinishedHailResponse = await getHail(hailId, await getImmutableUserApiKey(UserRole.Motor));
    assert.strictEqual(getFinishedHailResponse.status, StatusCodes.OK);
    assert.strictEqual(getFinishedHailResponse.body.data[0].status, StatusHail.FINISHED);
  });
}

function assertContainsTestCase(taxis: ITaxiResponseDto[], testCaseName: string) {
  assert.isNotNull(
    getTaxiFromTestCase(taxis, testCaseName),
    `${testCaseName} should return by search taxi motor integration tools`
  );
}

function getTaxiFromTestCase(taxis: ITaxiResponseDto[], testCaseName: string) {
  return taxis.find(x => x.vehicle.model === testCaseName);
}

function doTaxisIncludesTaxiId(taxis: ITaxiResponseDto[], id: string) {
  return taxis.some(taxi => taxi.id === id);
}
