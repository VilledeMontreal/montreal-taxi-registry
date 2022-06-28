// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import {
  generateSouthShoreCoordinates,
  generateSouthShoreLat,
  generateSouthShoreLon,
  getAirportCoordinates
} from '../shared/commonLoadTests/specialRegion';
import { aFewSeconds, shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { AssetTypes } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { updateUser } from '../users/user.apiClient';
import {
  createNonImmutableUser,
  createOperatorWithPromotion,
  getImmutableUserApiKey
} from '../users/user.sharedFixture';
import { postInquiry } from './inquiry.apiClient';
import {
  buildInquiryRequest,
  createTaxisWithPromotions,
  demoteOperatorTaxis,
  setupTaxiFromOptions
} from './inquiry.fixture';

// tslint:disable:max-line-length
export async function invalidInquiryTests(): Promise<void> {
  testInvalidAccessToInquiryEndpoint(UserRole.Operator);
  testInvalidAccessToInquiryEndpoint(UserRole.Manager);
  testInvalidAccessToInquiryEndpoint(UserRole.Inspector);
  testInvalidAccessToInquiryEndpoint(UserRole.Prefecture);
  testInvalidAccessToInquiryEndpoint(UserRole.Stats);

  it(`Should return Not Found when no taxi found`, async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator, true);
    const inquiryRequest = {
      from: { coordinates: generateSouthShoreCoordinates() },
      to: { coordinates: generateSouthShoreCoordinates() },
      useAssetTypes: [AssetTypes.Normal],
      operators: [newOperator.id]
    };
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not Found when no taxi is free`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat, lon, status: 'off' },
      { lat, lon, status: 'off' },
      { lat, lon, status: 'off' }
    ]);

    const inquiryRequest = buildInquiryRequest(
      { lat, lon },
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );

    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not Found when requesting a standard taxi and none are available`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const operators = await createTaxisWithPromotions([
      { lat: lat + 0.0001, lon, specialNeedVehicle: true },
      { lat: lat + 0.0001, lon, specialNeedVehicle: true, type: 'mpv' }
    ]);

    const inquiryRequest = buildInquiryRequest(
      { lat, lon },
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );

    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not found when requesting minivan and minivan is not promoted`, async () => {
    const promotions = { standard: true, minivan: false, special_need: false };
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
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not found when requesting standard and minivan is not promoted`, async () => {
    const promotions = { standard: true, minivan: false, special_need: false };
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
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not found when searching taxi not promoted`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();
    const taxiOptions = [
      { lat: lat + 0.0001, lon },
      { lat: lat + 0.0001, lon, type: 'mpv' }
    ];
    const promotions = { standard: false, minivan: false, special_need: false };
    const operators = await createTaxisWithPromotions(taxiOptions, promotions);
    await aFewSeconds(configs.inquiries.delayToExceedPromotion);

    const inquiryRequest = buildInquiryRequest(
      { lat, lon },
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );

    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not found when operator is demoted (promotion is removed) - standard`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const promotions = { standard: true, minivan: false, special_need: false };
    const newOperator = await createOperatorWithPromotion(promotions);
    const taxi = await setupTaxiFromOptions({ lat: lat + 0.0001, lon }, newOperator.apikey);

    const inquiryRequest = {
      from: { coordinates: { lat, lon } },
      to: { coordinates: generateSouthShoreCoordinates() },
      useAssetTypes: [AssetTypes.Normal],
      operators: [newOperator.id]
    };
    const inquiryResponse = await postInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);

    await demoteOperatorTaxis(newOperator, taxi);

    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not found when operator is demoted (promotion is removed) - minivan`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const promotions = { standard: true, minivan: true, special_need: false };
    const newOperator = await createOperatorWithPromotion(promotions);
    const taxi = await setupTaxiFromOptions({ lat: lat + 0.0001, lon, type: 'mpv' }, newOperator.apikey);

    const inquiryRequest = {
      from: { coordinates: { lat, lon } },
      to: { coordinates: generateSouthShoreCoordinates() },
      useAssetTypes: [AssetTypes.Mpv],
      operators: [newOperator.id]
    };
    const inquiryResponse = await postInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);

    await demoteOperatorTaxis(newOperator, taxi);

    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not found when operator is demoted (promotion is removed) - special_need`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();

    const promotions = { standard: false, minivan: false, special_need: true };
    const newOperator = await createOperatorWithPromotion(promotions);
    const taxi = await setupTaxiFromOptions({ lat: lat + 0.0001, lon, specialNeedVehicle: true }, newOperator.apikey);

    const inquiryRequest = {
      from: { coordinates: { lat, lon } },
      to: { coordinates: generateSouthShoreCoordinates() },
      useAssetTypes: [AssetTypes.SpecialNeed],
      operators: [newOperator.id]
    };
    const inquiryResponse = await postInquiry(inquiryRequest);
    assert.strictEqual(inquiryResponse.status, StatusCodes.OK);

    await demoteOperatorTaxis(newOperator, taxi);

    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Not found when searching promoted taxi that has not reached inquiries_starts_at time`, async () => {
    const { lat, lon } = generateSouthShoreCoordinates();
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
      generateSouthShoreCoordinates(),
      AssetTypes.Normal,
      operators
    );
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.NOT_FOUND);
      }
    );
  });

  it(`Should return Bad Request on missing top level properties`, async () => {
    const inquiryRequest = {};
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'more than one of its property are invalid');
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);
        assert.include(errorDetailsArray, 'from should not be null or undefined');
        assert.include(errorDetailsArray, 'to should not be null or undefined');
        assert.include(errorDetailsArray, 'useAssetTypes should not be null or undefined');
      }
    );
  });

  it(`Should return Bad Request on missing nested properties`, async () => {
    const inquiryRequest = { from: {}, to: { coordinates: {}, useAssetTypes: [AssetTypes.SpecialNeed] } };
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'more than one of its property are invalid');
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);
        assert.include(errorDetailsArray, 'coordinates should not be null or undefined');
        assert.include(errorDetailsArray, 'lat should not be null or undefined');
        assert.include(errorDetailsArray, 'lon should not be null or undefined');
      }
    );
  });

  it(`Should return Bad Request on invalid coordinates`, async () => {
    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: 'invalidLatitude', lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The latitude or longitude values are not valid');
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: 'invalidLongitude' } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The latitude or longitude values are not valid');
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: 'invalidLatitude', lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The latitude or longitude values are not valid');
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: 'invalidLongitude' } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The latitude or longitude values are not valid');
      }
    );
  });

  it(`Should return Bad Request when latitude and longitude are null values`, async () => {
    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: null, lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `lat should not be null or undefined`);
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: null } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `lon should not be null or undefined`);
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: null, lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `lat should not be null or undefined`);
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: null } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `lon should not be null or undefined`);
      }
    );
  });

  it(`Should return Bad Request when latitude or longitude out of bounds`, async () => {
    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: 90.000001, lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `The latitude or longitude values are not valid`);
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: 181 } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `The latitude or longitude values are not valid`);
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: -90.000001, lon: generateSouthShoreLon() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `The latitude or longitude values are not valid`);
      }
    );

    await shouldThrow(
      () =>
        postInquiry({
          from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
          to: { coordinates: { lat: generateSouthShoreLat(), lon: -181 } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `The latitude or longitude values are not valid`);
      }
    );
  });

  it(`Should return Bad Request if useAssetType type is not an array`, async () => {
    const inquiryRequest = {
      from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      useAssetTypes: {}
    };
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'each value in useAssetTypes must be a valid enum value');
      }
    );
  });

  it(`Should return Bad Request if useAssetType type is unknow`, async () => {
    const inquiryRequest = {
      from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      useAssetTypes: ['unknow_type']
    };
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'each value in useAssetTypes must be a valid enum value');
      }
    );
  });

  it(`Should return Bad Request if useAssetType type is empty`, async () => {
    const inquiryRequest = {
      from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      useAssetTypes: [] as string[]
    };
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'useAssetTypes must contain at least 1 elements');
      }
    );
  });

  it(`Should return Bad Request if useAssetType type contains more than one element`, async () => {
    const inquiryRequest = {
      from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      useAssetTypes: [AssetTypes.Normal, AssetTypes.SpecialNeed]
    };
    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'useAssetTypes must contain not more than 1 elements');
      }
    );
  });

  it(`Should return Bad Request when requesting from YUL/airport`, async () => {
    const inquiryRequest = {
      from: { coordinates: getAirportCoordinates() },
      to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      useAssetTypes: [AssetTypes.Normal]
    };

    await shouldThrow(
      () => postInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'Searching or hailing a taxi from the Montreal airport (YUL) zone is prohibited.'
        );
      }
    );
  });
}

function testInvalidAccessToInquiryEndpoint(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to inquiry`, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    const inquiryRequest = {
      from: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      to: { coordinates: { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() } },
      useAssetTypes: [AssetTypes.Normal]
    };
    await shouldThrow(
      () => postInquiry(inquiryRequest, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(
          err.response.body.error.message,
          'The user has a role which has insufficient permissions to access this resource.'
        );
      }
    );
  });
}
