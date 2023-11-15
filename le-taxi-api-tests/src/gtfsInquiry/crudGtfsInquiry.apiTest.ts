// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import {
  generateApiTestCoordinates,
  getAirportCoordinates,
  getDowntownCoordinates
} from '../shared/commonLoadTests/specialRegion';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { AssetTypes } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { createPromotedOperator, updateUser } from '../users/user.apiClient';
import {
  createNonImmutableUser,
  createOperatorWithPromotion,
  getImmutableUserApiKey
} from '../users/user.sharedFixture';
import { copyUserTemplate } from '../users/userDto.template';
import { postGtfsInquiry } from './gtfsInquiry.apiClient';
import {
  buildInquiryRequest,
  createTaxisWithPromotions,
  demoteOperatorTaxis,
  setupTaxiFromOptions
} from './gtfsInquiry.fixture';

// tslint:disable: max-func-body-length
export async function crudGtfsInquiryTests(): Promise<void> {
  testInquiryUserAccessValid(UserRole.Admin);
  testInquiryUserAccessValid(UserRole.Motor);

  it(`Should be able to request standard vehicle`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'sedan' }]);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to request a ride with no destination`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'sedan' }]);
    const inquiryRequest = buildInquiryRequest(generateApiTestCoordinates(), null, [AssetTypes.Normal], operators);
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to request a minivan`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'mpv' }]);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Mpv],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to receive a minivan when requesting minivan and minivan is promoted`, async () => {
    const promotions = { standard: true, minivan: true, special_need: false };
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'mpv' }], promotions);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Mpv],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to receive a minivan when requesting standard vehicle and minivan is promoted`, async () => {
    const promotions = { standard: true, minivan: true, special_need: false };
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'mpv' }], promotions);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should be able to request a special need vehicle`, async () => {
    const operators = await createTaxisWithPromotions([
      { ...generateApiTestCoordinates(), type: 'sedan', specialNeedVehicle: true }
    ]);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.SpecialNeed],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should return expected DTO format`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'sedan' }]);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

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
    assert.isNumber(inquiryResponse.body.options[0].pricing.parts[0].amount);
    assert.isString(inquiryResponse.body.options[0].pricing.parts[0].currencyCode);
    assert.isNumber(inquiryResponse.body.options[0].estimatedWaitTime);
    assert.isNumber(inquiryResponse.body.options[0].estimatedTravelTime);
    assert.isString(inquiryResponse.body.options[0].booking.agency.id);
    assert.isString(inquiryResponse.body.options[0].booking.agency.name);
    assert.isString(inquiryResponse.body.options[0].booking.mainAssetType.id);
    assert.isString(inquiryResponse.body.options[0].booking.phoneNumber);
    assert.isString(inquiryResponse.body.options[0].booking.androidUri);
    assert.isString(inquiryResponse.body.options[0].booking.iosUri);
    assert.isString(inquiryResponse.body.options[0].booking.webUrl);

    assert.match(inquiryResponse.body.options[0].booking.phoneNumber, new RegExp(`\\+1[0-9]{10}`));
  });

  it(`Should return null fields if booking information is missing`, async () => {
    const now = new Date(Date.now()).toISOString();
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.standard_booking_phone_number = '+1 (514) 555 1234';
      x.standard_booking_is_promoted_to_public = true;
      x.standard_booking_inquiries_starts_at = now;
    });
    const newOperator = await createPromotedOperator(userDto);
    await setupTaxiFromOptions({ ...generateApiTestCoordinates(), type: 'sedan' }, newOperator.apikey);

    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      [newOperator]
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.isString(inquiryResponse.body.validUntil);
    assert.isArray(inquiryResponse.body.options);
    assert.isNull(inquiryResponse.body.options[0].booking.androidUri);
    assert.isNull(inquiryResponse.body.options[0].booking.iosUri);
    assert.isNull(inquiryResponse.body.options[0].booking.webUrl);
  });

  it(`Should be able to return multiple responses if useAssetType type contains more than one element`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, specialNeedVehicle: true }, // Expected
      { lat: lat + 0.0001, lon, type: 'mpv' },
      { lat: lat + 0.0002, lon } // Expected
    ]);

    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal, AssetTypes.SpecialNeed],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 2);
  });

  it(`Should return only one element when useAssetType specifies the same type multiple times`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, specialNeedVehicle: true }, // Expected
      { lat: lat + 0.0001, lon, type: 'mpv' },
      { lat: lat + 0.0002, lon }
    ]);

    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal, AssetTypes.Normal, AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 1);
  });

  it(`Should return all vehicle types when useAssetType is empty`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, specialNeedVehicle: true }, // Expected
      { lat: lat + 0.0001, lon, type: 'mpv' }, // Expected
      { lat: lat + 0.0002, lon }, // Expected
      { lat: lat + 0.001, lon },
      { lat: lat + 0.002, lon }
    ]);

    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 3);
  });

  it(`Should return a validUntil in a 5 minute range (+- 30 seconds)`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'sedan' }]);
    const now = new Date();
    const validUntilLow = new Date(now.getTime() + 4.5 * 60 * 1000).toISOString();
    const validUntilHigh = new Date(now.getTime() + 5.5 * 60 * 1000).toISOString();
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.isTrue(inquiryResponse.body.validUntil > validUntilLow);
    assert.isTrue(inquiryResponse.body.validUntil < validUntilHigh);
  });

  it(`Should return closest taxi in range (1m apart)`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon }, // Expected
      { lat: lat + 0.000108, lon }, // 1m further
      { lat: lat + 0.00011, lon }, // 1.11m further
      { lat: lat + 0.0002, lon } // 9m further
    ]);
    const response = await postGtfsInquiry(
      buildInquiryRequest({ lat, lon }, generateApiTestCoordinates(), [AssetTypes.Normal], operators)
    );

    const closestOperator = response.body.options[0].booking.agency;
    const expectedTaxiIndex = 0;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.strictEqual(closestOperator.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Should return a regular taxi, even if special_need are closer`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, specialNeedVehicle: true },
      { lat: lat + 0.0001, lon, specialNeedVehicle: true, type: 'mpv' },
      { lat: lat + 0.0002, lon } // Expected
    ]);
    const response = await postGtfsInquiry(
      buildInquiryRequest({ lat, lon }, generateApiTestCoordinates(), [AssetTypes.Normal], operators)
    );

    const closestOperator = response.body.options[0].booking.agency;
    const expectedTaxiIndex = 2;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.strictEqual(closestOperator.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Should return a special_need taxi, even if regular/mpv are closer`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon },
      { lat: lat + 0.0001, lon, type: 'mpv' },
      { lat: lat + 0.0002, lon, specialNeedVehicle: true } // Expected
    ]);
    const response = await postGtfsInquiry(
      buildInquiryRequest({ lat, lon }, generateApiTestCoordinates(), [AssetTypes.SpecialNeed], operators)
    );

    const closestOperator = response.body.options[0].booking.agency;
    const expectedTaxiIndex = 2;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.strictEqual(closestOperator.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Should return a mpv, even if regular/special_need closer`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon },
      { lat: lat + 0.0001, lon, type: 'station_wagon' },
      { lat: lat + 0.0001, lon, specialNeedVehicle: true },
      { lat: lat + 0.0001, lon, type: 'mpv', specialNeedVehicle: true },
      { lat: lat + 0.0002, lon, type: 'mpv' } // Expected
    ]);
    const response = await postGtfsInquiry(
      buildInquiryRequest({ lat, lon }, generateApiTestCoordinates(), [AssetTypes.Mpv], operators)
    );

    const closestOperator = response.body.options[0].booking.agency;
    const expectedTaxiIndex = 4;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.strictEqual(closestOperator.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Can return a station_wagon same as sedan`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, type: 'station_wagon' },
      { lat: lat + 0.0002, lon }
    ]);
    const response = await postGtfsInquiry(
      buildInquiryRequest({ lat, lon }, generateApiTestCoordinates(), [AssetTypes.Normal], operators)
    );

    const closestOperator = response.body.options[0].booking.agency;
    const expectedTaxiIndex = 0;

    assert.strictEqual(response.status, StatusCodes.OK);
    assert.strictEqual(closestOperator.id, operators[expectedTaxiIndex].public_id);
  });

  it(`Can request a taxi with no operator specified`, async () => {
    await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'sedan' }]);
    const inquiryRequest = buildInquiryRequest(generateApiTestCoordinates(), generateApiTestCoordinates(), [
      AssetTypes.Normal
    ]);
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should account for bias and requestAndDispatch times at minimum`, async () => {
    const coordinates = generateApiTestCoordinates();
    await createTaxisWithPromotions([{ ...coordinates, type: 'sedan' }]);

    const inquiryRequest = buildInquiryRequest(coordinates, coordinates, [AssetTypes.Normal]);
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    const now = new Date();
    const fiveSecondsInMillis = 5000;
    const departureTime =
      now.getTime() +
      (configs.taxiRegistryOsrmApi.estimation.durationBias +
        configs.taxiRegistryOsrmApi.estimation.requestAndDispatchInSec) *
        1000;
    const departureTimeLow = new Date(departureTime - fiveSecondsInMillis).toISOString();
    const departureTimeHigh = new Date(departureTime + fiveSecondsInMillis).toISOString();
    const arrivalTime = departureTime + configs.taxiRegistryOsrmApi.estimation.durationBias * 1000;
    const arrivalTimeLow = new Date(arrivalTime - fiveSecondsInMillis).toISOString();
    const arrivalTimeHigh = new Date(arrivalTime + fiveSecondsInMillis).toISOString();

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.isTrue(inquiryResponse.body.options[0].departureTime > departureTimeLow);
    assert.isTrue(inquiryResponse.body.options[0].departureTime < departureTimeHigh);
    assert.isTrue(inquiryResponse.body.options[0].arrivalTime > arrivalTimeLow);
    assert.isTrue(inquiryResponse.body.options[0].arrivalTime < arrivalTimeHigh);
  });

  it(`Should return a fixed price for a ride from downtown to the airport`, async () => {
    const coordinates = generateApiTestCoordinates();
    await createTaxisWithPromotions([{ ...coordinates, type: 'sedan' }]);

    const downtownCoordinates = getDowntownCoordinates();
    const airportCoordinates = getAirportCoordinates();
    const inquiryRequest = buildInquiryRequest(downtownCoordinates, airportCoordinates, [AssetTypes.Normal]);
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    const estimatedPrice = inquiryResponse.body.options[0].pricing.parts[0].amount;
    const dailyPrice = configs.inquiries.fixedDailyPriceDowntownToAirport;
    const nightlyPrice = configs.inquiries.fixedNightlyPriceDowntownToAirport;
    assert.isTrue(estimatedPrice === dailyPrice || estimatedPrice === nightlyPrice);
  });

  it(`Should return a price for a ride from downtown to the south shore`, async () => {
    const coordinates = generateApiTestCoordinates();
    await createTaxisWithPromotions([{ ...coordinates, type: 'sedan' }]);

    const downtownCoordinates = getDowntownCoordinates();
    const southShoreCoordinates = generateApiTestCoordinates();
    const inquiryRequest = buildInquiryRequest(downtownCoordinates, southShoreCoordinates, [AssetTypes.Normal]);
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    const estimatedPrice = inquiryResponse.body.options[0].pricing.parts[0].amount;
    assert.isTrue(estimatedPrice > 0);
  });

  it(`Should return empty response when no taxi found`, async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    const inquiryRequest = {
      from: { coordinates: generateApiTestCoordinates() },
      to: { coordinates: generateApiTestCoordinates() },
      useAssetTypes: [AssetTypes.Normal],
      operators: [newOperator.id]
    };
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 0);
  });

  it(`Should return empty response when no taxi is free`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat, lon, status: 'off' },
      { lat, lon, status: 'off' },
      { lat, lon, status: 'off' }
    ]);

    const inquiryRequest = buildInquiryRequest(
      { lat, lon },
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 0);
  });

  it(`Should return empty response when requesting a standard taxi and none are available`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, specialNeedVehicle: true },
      { lat: lat + 0.0001, lon, specialNeedVehicle: true, type: 'mpv' }
    ]);

    const inquiryRequest = buildInquiryRequest(
      { lat, lon },
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 0);
  });

  it(`Should return empty response when requesting minivan and minivan is not promoted`, async () => {
    const promotions = { standard: true, minivan: false, special_need: false };
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'mpv' }], promotions);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Mpv],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 0);
  });

  it(`Should return empty response when requesting standard and minivan is not promoted`, async () => {
    const promotions = { standard: true, minivan: false, special_need: false };
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'mpv' }], promotions);
    const inquiryRequest = buildInquiryRequest(
      generateApiTestCoordinates(),
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 0);
  });

  it(`Should return empty response when searching taxi not promoted`, async () => {
    const { lat, lon } = generateApiTestCoordinates();
    const taxiOptions = [
      { lat: lat + 0.0001, lon },
      { lat: lat + 0.0001, lon, type: 'mpv' }
    ];
    const promotions = { standard: false, minivan: false, special_need: false };
    const operators = await createTaxisWithPromotions(taxiOptions, promotions);
    await aFewSeconds(configs.inquiries.delayToExceedPromotion);

    const inquiryRequest = buildInquiryRequest(
      { lat, lon },
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 0);
  });

  it(`Should return empty response when operator is demoted (promotion is removed) - standard`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const promotions = { standard: true, minivan: false, special_need: false };
    const newOperator = await createOperatorWithPromotion(promotions);
    const taxi = await setupTaxiFromOptions({ lat: lat + 0.0001, lon }, newOperator.apikey);

    const inquiryRequest = {
      from: { coordinates: { lat, lon } },
      to: { coordinates: generateApiTestCoordinates() },
      useAssetTypes: [AssetTypes.Normal],
      operators: [newOperator.id]
    };
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);

    await demoteOperatorTaxis(newOperator, taxi);

    const inquiryResponseAfterDemotion = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponseAfterDemotion.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponseAfterDemotion.body.options.length, 0);
  });

  it(`Should return empty response when operator is demoted (promotion is removed) - minivan`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const promotions = { standard: true, minivan: true, special_need: false };
    const newOperator = await createOperatorWithPromotion(promotions);
    const taxi = await setupTaxiFromOptions({ lat: lat + 0.0001, lon, type: 'mpv' }, newOperator.apikey);

    const inquiryRequest = {
      from: { coordinates: { lat, lon } },
      to: { coordinates: generateApiTestCoordinates() },
      useAssetTypes: [AssetTypes.Mpv],
      operators: [newOperator.id]
    };
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);

    await demoteOperatorTaxis(newOperator, taxi);
    const inquiryResponseAfterDemotion = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponseAfterDemotion.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponseAfterDemotion.body.options.length, 0);
  });

  it(`Should return empty response when operator is demoted (promotion is removed) - special_need`, async () => {
    const { lat, lon } = generateApiTestCoordinates();

    const promotions = { standard: false, minivan: false, special_need: true };
    const newOperator = await createOperatorWithPromotion(promotions);
    const taxi = await setupTaxiFromOptions({ lat: lat + 0.0001, lon, specialNeedVehicle: true }, newOperator.apikey);

    const inquiryRequest = {
      from: { coordinates: { lat, lon } },
      to: { coordinates: generateApiTestCoordinates() },
      useAssetTypes: [AssetTypes.SpecialNeed],
      operators: [newOperator.id]
    };
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);

    await demoteOperatorTaxis(newOperator, taxi);
    const inquiryResponseAfterDemotion = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponseAfterDemotion.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponseAfterDemotion.body.options.length, 0);
  });

  it(`Should return empty response when searching promoted taxi that has not reached inquiries_starts_at time`, async () => {
    const { lat, lon } = generateApiTestCoordinates();
    const taxiOptions = [
      { lat: lat + 0.0001, lon },
      { lat: lat + 0.0001, lon, type: 'mpv' }
    ];
    const promotions = { standard: false, minivan: false, special_need: false };
    const operators = await createTaxisWithPromotions(taxiOptions, promotions);

    const promotedOperators = operators.map(async operator => {
      operator.standard_booking_website_url = 'http://test.ca';
      operator.standard_booking_is_promoted_to_public = true;
      delete operator.password;
      delete operator.apikey;
      return await updateUser(operator);
    });
    await Promise.all(promotedOperators);

    const inquiryRequest = buildInquiryRequest(
      { lat, lon },
      generateApiTestCoordinates(),
      [AssetTypes.Normal],
      operators
    );
    const inquiryResponse = await postGtfsInquiry(inquiryRequest);

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.strictEqual(inquiryResponse.body.options.length, 0);
  });

  it(`Can request with null field TO`, async () => {
    const inquiryResponse = await postGtfsInquiry({
      from: { coordinates: generateApiTestCoordinates() },
      to: null,
      useAssetTypes: [AssetTypes.Normal]
    });
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Can request with an undefined field TO`, async () => {
    const inquiryResponse = await postGtfsInquiry({
      from: { coordinates: generateApiTestCoordinates() },
      useAssetTypes: [AssetTypes.Normal]
    });
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Can request with null coordinates in the field TO`, async () => {
    const inquiryResponse = await postGtfsInquiry({
      from: { coordinates: generateApiTestCoordinates() },
      to: { coordinates: null },
      useAssetTypes: [AssetTypes.Normal]
    });
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Can request with undefined coordinates in the field TO`, async () => {
    const inquiryResponse = await postGtfsInquiry({
      from: { coordinates: generateApiTestCoordinates() },
      to: {},
      useAssetTypes: [AssetTypes.Normal]
    });
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });

  it(`Should nullify field in the response when no destination is provided`, async () => {
    const operators = await createTaxisWithPromotions([{ ...generateApiTestCoordinates(), type: 'sedan' }]);
    const inquiryResponse = await postGtfsInquiry({
      from: { coordinates: generateApiTestCoordinates() },
      useAssetTypes: [AssetTypes.Normal],
      operators: operators?.map(operator => operator.id)
    });

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
    assert.isNull(inquiryResponse.body.options[0].arrivalTime);
    assert.isNull(inquiryResponse.body.options[0].to.coordinates);
    assert.isNull(inquiryResponse.body.options[0].pricing);
    assert.isNull(inquiryResponse.body.options[0].estimatedTravelTime);
  });
}

function testInquiryUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to inquiry`, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    const operators = await createTaxisWithPromotions([generateApiTestCoordinates()]);

    const inquiryResponse = await postGtfsInquiry(
      buildInquiryRequest(generateApiTestCoordinates(), generateApiTestCoordinates(), [AssetTypes.Normal], operators),
      apiKey
    );

    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);
  });
}
