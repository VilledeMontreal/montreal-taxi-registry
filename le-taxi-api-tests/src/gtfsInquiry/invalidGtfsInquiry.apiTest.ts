// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import {
  generateLatForApiTest,
  generateLonForApiTest,
  getAirportCoordinates
} from '../shared/commonLoadTests/specialRegion';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { AssetTypes } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { postGtfsInquiry } from './gtfsInquiry.apiClient';

// tslint:disable: max-func-body-length
export async function invalidGtfsInquiryTests(): Promise<void> {
  testInvalidAccessToInquiryEndpoint(UserRole.Operator);
  testInvalidAccessToInquiryEndpoint(UserRole.Manager);
  testInvalidAccessToInquiryEndpoint(UserRole.Inspector);
  testInvalidAccessToInquiryEndpoint(UserRole.Prefecture);
  testInvalidAccessToInquiryEndpoint(UserRole.Stats);

  it(`Should return Bad Request on missing top level properties`, async () => {
    const inquiryRequest = {};
    await shouldThrow(
      () => postGtfsInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'more than one of its property are invalid');
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);
        assert.include(errorDetailsArray, 'from should not be null or undefined');
        assert.include(errorDetailsArray, 'useAssetTypes should not be null or undefined');
      }
    );
  });

  it(`Should return Bad Request on missing from coordinates`, async () => {
    const inquiryRequest = { from: {}, to: { coordinates: {} }, useAssetTypes: [AssetTypes.SpecialNeed] };
    await shouldThrow(
      () => postGtfsInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'coordinates should not be null or undefined');
      }
    );
  });

  it(`Should return Bad Request on missing from lat/lon`, async () => {
    const inquiryRequest = { from: { coordinates: {} }, to: {}, useAssetTypes: [AssetTypes.SpecialNeed] };
    await shouldThrow(
      () => postGtfsInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'more than one of its property are invalid');
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);
        assert.include(errorDetailsArray, 'lat should not be null or undefined');
        assert.include(errorDetailsArray, 'lon should not be null or undefined');
      }
    );
  });

  it(`Should return Bad Request on invalid coordinates`, async () => {
    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: 'invalidLatitude', lon: generateLonForApiTest() } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because lat must not be greater than 90'
        );
      }
    );

    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: generateLatForApiTest(), lon: 'invalidLongitude' } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because lon must not be greater than 180'
        );
      }
    );

    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          to: { coordinates: { lat: 'invalidLatitude', lon: generateLonForApiTest() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because lat must not be greater than 90'
        );
      }
    );

    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: 'invalidLongitude' } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because lon must not be greater than 180'
        );
      }
    );
  });

  it(`Should return Bad Request when latitude and longitude are null values`, async () => {
    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: null, lon: generateLonForApiTest() } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `lat should not be null or undefined`);
      }
    );

    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: generateLatForApiTest(), lon: null } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
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
        postGtfsInquiry({
          from: { coordinates: { lat: 90.000001, lon: generateLonForApiTest() } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          `The object failed the validation because lat must not be greater than 90`
        );
      }
    );

    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: generateLatForApiTest(), lon: 181 } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          `The object failed the validation because lon must not be greater than 180`
        );
      }
    );

    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          to: { coordinates: { lat: -90.000001, lon: generateLonForApiTest() } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          `The object failed the validation because lat must not be less than -90`
        );
      }
    );

    await shouldThrow(
      () =>
        postGtfsInquiry({
          from: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
          to: { coordinates: { lat: generateLatForApiTest(), lon: -181 } },
          useAssetTypes: [AssetTypes.Normal]
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          `The object failed the validation because lon must not be less than -180`
        );
      }
    );
  });

  it(`Should return Bad Request if useAssetType type is not an array`, async () => {
    const inquiryRequest = {
      from: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
      to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
      useAssetTypes: {}
    };
    await shouldThrow(
      () => postGtfsInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'each value in useAssetTypes must be a valid enum value');
      }
    );
  });

  it(`Should return Bad Request if useAssetType type is unknow`, async () => {
    const inquiryRequest = {
      from: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
      to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
      useAssetTypes: ['unknow_type']
    };
    await shouldThrow(
      () => postGtfsInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'each value in useAssetTypes must be a valid enum value');
      }
    );
  });

  it(`Should return Bad Request when requesting from YUL/airport`, async () => {
    const inquiryRequest = {
      from: { coordinates: getAirportCoordinates() },
      to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
      useAssetTypes: [AssetTypes.Normal]
    };

    await shouldThrow(
      () => postGtfsInquiry(inquiryRequest),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'Requesting a taxi from the Montreal airport (YUL) zone is prohibited.'
        );
      }
    );
  });
}

function testInvalidAccessToInquiryEndpoint(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to inquiry`, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    const inquiryRequest = {
      from: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
      to: { coordinates: { lat: generateLatForApiTest(), lon: generateLonForApiTest() } },
      useAssetTypes: [AssetTypes.Normal]
    };
    await shouldThrow(
      () => postGtfsInquiry(inquiryRequest, apiKey),
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
