// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { generateApiTestCoordinates } from '../shared/commonLoadTests/specialRegion';
import { UserRole } from '../shared/commonTests/UserRole';
import { getCurrentUnixTime } from '../shared/commonTests/testUtil';
import { copyTaxiPositionTemplate } from '../taxiPositionSnapShots/taxiPositionSnapShotsDto.template';
import { postTaxiPositionSnapshots } from '../taxiPositionSnapShots/taxiPositionSnapshots.apiClient';
import { setupNewTaxi } from '../taxis/taxi.fixture';
import { copyTaxiTemplate } from '../taxis/taxisDto.template';
import { createOperatorWithPromotion, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getLatestTaxiPositions } from './latestTaxiPosition.apiClient';

// tslint:disable-next-line: max-func-body-length
export async function crudLatestTaxiPositionTests(): Promise<void> {
  testLatestTaxiPositionsAccessValid(UserRole.Admin);
  testLatestTaxiPositionsAccessValid(UserRole.Manager);
  testLatestTaxiPositionsAccessValid(UserRole.Inspector);

  it('Can retrieve taxi position from latestTaxiPosition feature', async () => {
    const promotions = { standard: true, minivan: true, special_need: true };
    const newOperator = await createOperatorWithPromotion(promotions);
    const dtoCreate = copyTaxiTemplate();
    let response = await setupNewTaxi(dtoCreate, newOperator.apikey);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const operator = response.body.data[0].operator;
    const taxiId = response.body.data[0].id;
    const { lat, lon } = generateApiTestCoordinates();
    const dtoTaxiPosition = copyTaxiPositionTemplate(x => {
      x.items[0].lat = lat;
      x.items[0].lon = lon;
      x.items[0].taxi = taxiId;
      x.items[0].operator = operator;
      x.items[0].timestamp = getCurrentUnixTime();
    });

    response = await postTaxiPositionSnapshots(dtoTaxiPosition, newOperator.apikey);
    assert.strictEqual(response.status, StatusCodes.OK);

    response = await getLatestTaxiPositions();
    assert.strictEqual(response.status, StatusCodes.OK);

    const features = response.body.features.filter(
      (feature: any) => feature.properties.taxi.operatorId === newOperator.id
    );

    assert.strictEqual(features.length, 1);
    assert.strictEqual(features[0].properties.taxiId, taxiId);
    assert.strictEqual(features[0].properties.taxi.operatorId, newOperator.id);
    assert.strictEqual(features[0].properties.status, 'free');
    assert.strictEqual(features[0].geometry.coordinates[0], lon);
    assert.strictEqual(features[0].geometry.coordinates[1], lat);
    assert.strictEqual(features[0].geometry.coordinates.length, 2);
    assert.strictEqual(features[0].geometry.type, 'Point');
  });
}

function testLatestTaxiPositionsAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access LatestTaxiPositions`, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    const response = await getLatestTaxiPositions(apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
  });
}
