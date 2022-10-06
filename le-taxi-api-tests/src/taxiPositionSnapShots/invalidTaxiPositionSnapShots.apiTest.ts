// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { postTaxiPositionSnapshots } from './taxiPositionSnapshots.apiClient';
import { getValidTaxiPositionSnapshotDtoAndApikey } from './taxiPositionSnapshots.fixture';

// tslint:disable-next-line: max-func-body-length
export async function invalidTaxiPositionSnapShotsTests(): Promise<void> {
  testCreateTaxiPositionSnapShotsUserAccessInvalid(UserRole.Admin);
  testCreateTaxiPositionSnapShotsUserAccessInvalid(UserRole.Motor);
  testCreateTaxiPositionSnapShotsUserAccessInvalid(UserRole.Inspector);
  testCreateTaxiPositionSnapShotsUserAccessInvalid(UserRole.Manager);
  testCreateTaxiPositionSnapShotsUserAccessInvalid(UserRole.Stats);
  testCreateTaxiPositionSnapShotsUserAccessInvalid(UserRole.Prefecture);

  it('should return error when operator sends a taxi that doesnt exist.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 3);

    dtoTaxiPositionSnapShot.items[0].taxi = 'unknowntaxi';

    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `some taxis are not existing in the system`);
      }
    );
  });

  it('should return error when operator sends positions for a taxi that doesnt belong to him.', async () => {
    const [dtoTaxiPositionSnapShotA] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    const [dtoTaxiPositionSnapShotB, operatorB] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);

    dtoTaxiPositionSnapShotA.items[0].operator = dtoTaxiPositionSnapShotB.items[0].operator;

    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShotA, operatorB),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, `some taxis do not belong to the operator`);
      }
    );
  });

  it('should return error when items array is missing.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    delete dtoTaxiPositionSnapShot.items;

    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'taxi position snapshot is not in a valid JSON format');
      }
    );
  });

  it('should return error when one or several params are missing.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    delete dtoTaxiPositionSnapShot.items[0].azimuth;
    delete dtoTaxiPositionSnapShot.items[0].version;
    delete dtoTaxiPositionSnapShot.items[0].lat;
    delete dtoTaxiPositionSnapShot.items[0].lon;
    delete dtoTaxiPositionSnapShot.items[0].taxi;
    delete dtoTaxiPositionSnapShot.items[0].device;
    delete dtoTaxiPositionSnapShot.items[0].speed;
    delete dtoTaxiPositionSnapShot.items[0].status;
    delete dtoTaxiPositionSnapShot.items[0].operator;
    delete dtoTaxiPositionSnapShot.items[0].timestamp;
    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'Multiple validation errors were found for this taxi position snapshot'
        );
        assert.include(errorDetailsArray, 'the latitude is not valid');
        assert.include(errorDetailsArray, 'the longitude is not valid');
        assert.include(errorDetailsArray, 'the taxi identifier is missing');
        assert.include(errorDetailsArray, 'the device is not valid');
        assert.include(errorDetailsArray, 'the status is not valid');
        assert.include(errorDetailsArray, 'the speed attribute is mandatory and must be a number');
        assert.include(errorDetailsArray, 'the azimuth is not valid');
        assert.include(errorDetailsArray, 'the version is not valid');
        assert.include(errorDetailsArray, 'the operator is either missing or has an invalid API key');
        assert.include(
          errorDetailsArray,
          'the timestamp must be in a valid UTC format, no older than a minute from the time the request was sent and not set in the future'
        );
      }
    );
  });

  it('should return error when timestamp, lat, lon, version, speed, operator or status is wrong.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    dtoTaxiPositionSnapShot.items[0].timestamp = 0;
    dtoTaxiPositionSnapShot.items[0].lat = 'notAnumber';
    dtoTaxiPositionSnapShot.items[0].lon = 'notAfloat';
    dtoTaxiPositionSnapShot.items[0].status = 'wrong-status';
    dtoTaxiPositionSnapShot.items[0].speed = 'notAspeed';
    dtoTaxiPositionSnapShot.items[0].version = '3';
    dtoTaxiPositionSnapShot.items[0].operator = 'wrong-operator';
    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'Multiple validation errors were found for this taxi position snapshot'
        );
        assert.include(errorDetailsArray, 'the latitude is not valid');
        assert.include(errorDetailsArray, 'the longitude is not valid');
        assert.include(errorDetailsArray, 'the status is not valid');
        assert.include(errorDetailsArray, 'the speed attribute is mandatory and must be a number');
        assert.include(errorDetailsArray, 'the version is not valid');
        assert.include(errorDetailsArray, 'the operator is either missing or has an invalid API key');
        assert.include(
          errorDetailsArray,
          'the timestamp must be in a valid UTC format, no older than a minute from the time the request was sent and not set in the future'
        );
      }
    );
  });

  it('should return error when lat/lon is invalid.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 7);

    dtoTaxiPositionSnapShot.items[0].lat = null;
    dtoTaxiPositionSnapShot.items[0].lon = null;

    dtoTaxiPositionSnapShot.items[1].lat = undefined;
    dtoTaxiPositionSnapShot.items[1].lon = undefined;

    dtoTaxiPositionSnapShot.items[2].lat = NaN;
    dtoTaxiPositionSnapShot.items[2].lon = NaN;

    dtoTaxiPositionSnapShot.items[3].lat = 0 / 0;
    dtoTaxiPositionSnapShot.items[3].lon = 0 / 0;

    dtoTaxiPositionSnapShot.items[4].lat = '0.000abc';
    dtoTaxiPositionSnapShot.items[4].lon = '0.000+/';

    dtoTaxiPositionSnapShot.items[5].lat = 'null';
    dtoTaxiPositionSnapShot.items[5].lon = 'null';

    dtoTaxiPositionSnapShot.items[6].lat = 'true';
    dtoTaxiPositionSnapShot.items[6].lon = 'false';

    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);

        const latitudeInvalid = errorDetailsArray.filter((e: string) => e.indexOf('latitude is not valid') !== -1);
        assert.strictEqual(latitudeInvalid.length, 7);
        const longitudeInvalid = errorDetailsArray.filter((e: string) => e.indexOf('longitude is not valid') !== -1);
        assert.strictEqual(longitudeInvalid.length, 7);
      }
    );
  });

  it('should return error when lat/lon is out of bounds.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 2);

    dtoTaxiPositionSnapShot.items[0].lat = 90.01;
    dtoTaxiPositionSnapShot.items[0].lon = -180.01;

    dtoTaxiPositionSnapShot.items[1].lat = '-90.01';
    dtoTaxiPositionSnapShot.items[1].lon = '-180.01';

    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);

        const latitudeOOB = errorDetailsArray.filter((e: string) => e.indexOf('latitude is out of bounds') !== -1);
        assert.strictEqual(latitudeOOB.length, 2);
        const longitudeOOB = errorDetailsArray.filter((e: string) => e.indexOf('longitude is out of bounds') !== -1);
        assert.strictEqual(longitudeOOB.length, 2);
      }
    );
  });

  it('should return error when azimuth is invalid.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 7);

    dtoTaxiPositionSnapShot.items[0].azimuth = null;
    dtoTaxiPositionSnapShot.items[1].azimuth = undefined;
    dtoTaxiPositionSnapShot.items[2].azimuth = NaN;
    dtoTaxiPositionSnapShot.items[3].azimuth = 0 / 0;
    dtoTaxiPositionSnapShot.items[4].azimuth = '0.000abc';
    dtoTaxiPositionSnapShot.items[5].azimuth = 'null';
    dtoTaxiPositionSnapShot.items[6].azimuth = 'true';

    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);

        const azimuthInvalid = errorDetailsArray.filter((e: string) => e.indexOf('azimuth is not valid') !== -1);
        assert.strictEqual(azimuthInvalid.length, 7);
      }
    );
  });

  it('should return error when azimuth is out of bounds.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 4);

    dtoTaxiPositionSnapShot.items[0].azimuth = -1; // Range being 0 to 360
    dtoTaxiPositionSnapShot.items[1].azimuth = 361; // Range being 0 to 360

    dtoTaxiPositionSnapShot.items[1].azimuth = '-1';
    dtoTaxiPositionSnapShot.items[1].azimuth = '361';

    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        const errorDetailsArray = err.response.body.error.details.map((detail: any) => detail.message);

        const azimuthOOB = errorDetailsArray.filter((e: string) => e.indexOf('azimuth is out of bounds') !== -1);
        assert.strictEqual(azimuthOOB.length, 2);
      }
    );
  });

  it('should return error when timestamp is older than one minute.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    dtoTaxiPositionSnapShot.items[0].timestamp -= 1000 * 65;
    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'the timestamp must be in a valid UTC format, no older than a minute from the time the request was sent and not set in the future'
        );
      }
    );
  });

  it('should return error when timestamp is in future.', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    dtoTaxiPositionSnapShot.items[0].timestamp += 1000 * 65;
    await shouldThrow(
      () => postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'the timestamp must be in a valid UTC format, no older than a minute from the time the request was sent and not set in the future'
        );
      }
    );
  });
}

function testCreateTaxiPositionSnapShotsUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to send taxi position snapshot`, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    const [dtoTaxiPositionSnapShot] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    await shouldThrow(
      async () => await postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey),
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
