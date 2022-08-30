// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { generateSouthShoreCoordinates } from '../shared/commonLoadTests/specialRegion';
import { UserRole } from '../shared/commonTests/UserRole';
import { AssetTypes } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { postInquiry } from './inquiry.apiClient';
import { buildInquiryRequest, createTaxisWithPromotions } from './inquiry.fixture';

// tslint:disable: max-func-body-length
export async function crudInquiryTests(): Promise<void> {
  testInquiryUserAccessValid(UserRole.Admin);
  testInquiryUserAccessValid(UserRole.Motor);

  it(`Should be able to request standard vehicle`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateSouthShoreCoordinates(), type: 'sedan' }]);
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to request a minivan`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateSouthShoreCoordinates(), type: 'mpv' }]);
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.Mpv,
      operators
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to receive a minivan when requesting minivan and minivan is promoted`, async () => {
    const promotions = { standard: true, minivan: true, special_need: false };
    const operators = await createTaxisWithPromotions(
      [{ ...generateSouthShoreCoordinates(), type: 'mpv' }],
      promotions
    );
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.Mpv,
      operators
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to receive a minivan when requesting standard vehicle and minivan is promoted`, async () => {
    const promotions = { standard: true, minivan: true, special_need: false };
    const operators = await createTaxisWithPromotions(
      [{ ...generateSouthShoreCoordinates(), type: 'mpv' }],
      promotions
    );
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to request a special need vehicle`, async () => {
    const operators = await createTaxisWithPromotions([
      { ...generateSouthShoreCoordinates(), type: 'sedan', specialNeedVehicle: true }
    ]);
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.SpecialNeed,
      operators
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should return expected DTO format`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateSouthShoreCoordinates(), type: 'sedan' }]);
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.isString(inquiryResponse.body.validUntil);
    assert.isArray(inquiryResponse.body.options);
    assert.isString(inquiryResponse.body.options[0].mainAssetType.id);
    assert.isString(inquiryResponse.body.options[0].departureTime);
    assert.isString(inquiryResponse.body.options[0].arrivalTime);
    assert.isNumber(inquiryResponse.body.options[0].from.coordinates.lat);
    assert.isNumber(inquiryResponse.body.options[0].from.coordinates.lon);
    assert.isNumber(inquiryResponse.body.options[0].to.coordinates.lat);
    assert.isNumber(inquiryResponse.body.options[0].to.coordinates.lon);
    assert.isBoolean(inquiryResponse.body.options[0].pricing.estimated);
    assert.isNumber(inquiryResponse.body.options[0].pricing.parts[0].optimisticAmount);
    assert.isNumber(inquiryResponse.body.options[0].pricing.parts[0].amount);
    assert.isNumber(inquiryResponse.body.options[0].pricing.parts[0].pessimisticAmount);
    assert.isString(inquiryResponse.body.options[0].pricing.parts[0].currencyCode);
  });

  it(`Should return a validUntil in a 5 minute range (+- 30 seconds)`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateSouthShoreCoordinates(), type: 'sedan' }]);
    const now = new Date();
    const validUntilLow = new Date(now.getTime() + 4.5 * 60 * 1000).toISOString();
    const validUntilHigh = new Date(now.getTime() + 5.5 * 60 * 1000).toISOString();
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.isTrue(inquiryResponse.body.validUntil > validUntilLow);
    assert.isTrue(inquiryResponse.body.validUntil < validUntilHigh);
  });

  it(`Should return closest taxi in range (1m apart)`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon }, // Expected
      { lat: lat + 0.000108, lon }, // 1m further
      { lat: lat + 0.00011, lon }, // 1.11m further
      { lat: lat + 0.0002, lon } // 9m further
    ]);
    const response = await postInquiry(
      buildInquiryRequest({ lat, lon }, generateSouthShoreCoordinates(), AssetTypes.Normal, operators)
    );

    const closestOperatorRoute = response.body.options[0].mainAssetType;
    const expectedTaxiIndex = 0;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.include(closestOperatorRoute.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Should return a regular taxi, even if special_need are closer`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, specialNeedVehicle: true },
      { lat: lat + 0.0001, lon, specialNeedVehicle: true, type: 'mpv' },
      { lat: lat + 0.0002, lon } // Expected
    ]);
    const response = await postInquiry(
      buildInquiryRequest({ lat, lon }, generateSouthShoreCoordinates(), AssetTypes.Normal, operators)
    );

    const closestOperatorRoute = response.body.options[0].mainAssetType;
    const expectedTaxiIndex = 2;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.include(closestOperatorRoute.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Should return a special_need taxi, even if regular/mpv are closer`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon },
      { lat: lat + 0.0001, lon, type: 'mpv' },
      { lat: lat + 0.0002, lon, specialNeedVehicle: true } // Expected
    ]);
    const response = await postInquiry(
      buildInquiryRequest({ lat, lon }, generateSouthShoreCoordinates(), AssetTypes.SpecialNeed, operators)
    );

    const closestOperatorRoute = response.body.options[0].mainAssetType;
    const expectedTaxiIndex = 2;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.include(closestOperatorRoute.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Should return a mpv, even if regular/special_need closer`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon },
      { lat: lat + 0.0001, lon, type: 'station_wagon' },
      { lat: lat + 0.0001, lon, specialNeedVehicle: true },
      { lat: lat + 0.0001, lon, type: 'mpv', specialNeedVehicle: true },
      { lat: lat + 0.0002, lon, type: 'mpv' } // Expected
    ]);
    const response = await postInquiry(
      buildInquiryRequest({ lat, lon }, generateSouthShoreCoordinates(), AssetTypes.Mpv, operators)
    );

    const closestOperatorRoute = response.body.options[0].mainAssetType;
    const expectedTaxiIndex = 4;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.include(closestOperatorRoute.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Can return a station_wagon same as sedan`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, type: 'station_wagon' },
      { lat: lat + 0.0002, lon }
    ]);
    const response = await postInquiry(
      buildInquiryRequest({ lat, lon }, generateSouthShoreCoordinates(), AssetTypes.Normal, operators)
    );

    const closestOperatorRoute = response.body.options[0].mainAssetType;
    const expectedTaxiIndex = 0;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.include(closestOperatorRoute.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Can request a taxi with no operator specified`, async () => {
    await createTaxisWithPromotions([{ ...generateSouthShoreCoordinates(), type: 'sedan' }]);
    const inquiryRequest = buildInquiryRequest(
      generateSouthShoreCoordinates(),
      generateSouthShoreCoordinates(),
      AssetTypes.Normal
    );
    const inquiryResponse = await postInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should account for bias and requestAndDispatch times at minimum`, async () => {
    const coordinates = generateSouthShoreCoordinates();
    await createTaxisWithPromotions([{ ...coordinates, type: 'sedan' }]);

    const inquiryRequest = buildInquiryRequest(
      coordinates,
      coordinates,
      AssetTypes.Normal
      );
      const inquiryResponse = await postInquiry(inquiryRequest);

    const now = new Date();
    const fiveSecondsInMillis = 5000;
    const departureTime = now.getTime() + (configs.taxiRegistryOsrmApi.estimation.biasInSec + configs.taxiRegistryOsrmApi.estimation.requestAndDispatchInSec) * 1000;
    const departureTimeLow = new Date(departureTime - fiveSecondsInMillis).toISOString();
    const departureTimeHigh = new Date(departureTime + fiveSecondsInMillis).toISOString();
    const arrivalTime = departureTime + configs.taxiRegistryOsrmApi.estimation.biasInSec * 1000;
    const arrivalTimeLow = new Date(arrivalTime - fiveSecondsInMillis).toISOString();
    const arrivalTimeHigh = new Date(arrivalTime + fiveSecondsInMillis).toISOString();

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.isTrue(inquiryResponse.body.options[0].departureTime > departureTimeLow);
    assert.isTrue(inquiryResponse.body.options[0].departureTime < departureTimeHigh);
    assert.isTrue(inquiryResponse.body.options[0].arrivalTime > arrivalTimeLow);
    assert.isTrue(inquiryResponse.body.options[0].arrivalTime < arrivalTimeHigh);
  });
}

function testInquiryUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to inquiry`, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    const operators = await createTaxisWithPromotions([generateSouthShoreCoordinates()]);

    const inquiryResponse = await postInquiry(
      buildInquiryRequest(
        generateSouthShoreCoordinates(),
        generateSouthShoreCoordinates(),
        AssetTypes.Normal,
        operators
      ),
      apiKey
    );

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });
}
