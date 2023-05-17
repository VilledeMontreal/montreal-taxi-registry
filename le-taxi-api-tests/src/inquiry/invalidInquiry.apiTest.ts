// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import {
  generateSouthShoreLat,
  generateSouthShoreLon,
  getAirportCoordinates
} from '../shared/commonLoadTests/specialRegion';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { AssetTypes } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { postInquiry } from './inquiry.apiClient';

// tslint:disable: max-func-body-length
export async function invalidInquiryTests(): Promise<void> {
  testInvalidAccessToInquiryEndpoint(UserRole.Operator);
  testInvalidAccessToInquiryEndpoint(UserRole.Manager);
  testInvalidAccessToInquiryEndpoint(UserRole.Inspector);
  testInvalidAccessToInquiryEndpoint(UserRole.Prefecture);
  testInvalidAccessToInquiryEndpoint(UserRole.Stats);

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
