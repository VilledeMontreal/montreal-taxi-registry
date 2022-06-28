// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';

import { UserRole } from '../shared/commonTests/UserRole';
import { postTaxiPositionSnapshots } from './taxiPositionSnapshots.apiClient';
import { getValidTaxiPositionSnapshotDtoAndApikey } from './taxiPositionSnapshots.fixture';

export async function crudTaxiPositionSnapShotsTests(): Promise<void> {
  testCreatePositionSnapshotsUserAccessValid(UserRole.Operator);

  it('Should be able to persist taxi-position-snapshot directly from template', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator);
    const response = await postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey);

    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it('Should be able to persist taxi-position-snapshot with different lat/lon formats', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 6);

    dtoTaxiPositionSnapShot.items[0].lat = 45.515151;
    dtoTaxiPositionSnapShot.items[0].lon = -73.585858;

    dtoTaxiPositionSnapShot.items[1].lat = 45;
    dtoTaxiPositionSnapShot.items[1].lon = -73;

    dtoTaxiPositionSnapShot.items[2].lat = 0;
    dtoTaxiPositionSnapShot.items[2].lon = -0;

    dtoTaxiPositionSnapShot.items[3].lat = '45.515151';
    dtoTaxiPositionSnapShot.items[3].lon = '-73.585858';

    dtoTaxiPositionSnapShot.items[4].lat = '45';
    dtoTaxiPositionSnapShot.items[4].lon = '-73';

    dtoTaxiPositionSnapShot.items[5].lat = '0';
    dtoTaxiPositionSnapShot.items[5].lon = '-0';

    const response = await postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey);

    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it('Should be able to persist taxi-position-snapshot with extreme lat/lon', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 2);

    dtoTaxiPositionSnapShot.items[0].lat = 90;
    dtoTaxiPositionSnapShot.items[0].lon = 180;

    dtoTaxiPositionSnapShot.items[1].lat = -90;
    dtoTaxiPositionSnapShot.items[1].lon = -180;

    const response = await postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey);

    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it('Should be able to persist taxi-position-snapshot with different azimuth formats', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 6);

    dtoTaxiPositionSnapShot.items[0].azimuth = 180.123;
    dtoTaxiPositionSnapShot.items[1].azimuth = 180;
    dtoTaxiPositionSnapShot.items[2].azimuth = 0;
    dtoTaxiPositionSnapShot.items[3].azimuth = '180.123';
    dtoTaxiPositionSnapShot.items[4].azimuth = '180';
    dtoTaxiPositionSnapShot.items[5].azimuth = '0';

    const response = await postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey);

    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it('Should be able to persist taxi-position-snapshot with azimuth 360 (and convert it to 0)', async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(UserRole.Operator, 2);

    dtoTaxiPositionSnapShot.items[0].azimuth = 360;
    dtoTaxiPositionSnapShot.items[1].azimuth = '360';

    const response = await postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey);

    assert.strictEqual(response.status, StatusCodes.OK);
  });
}

function testCreatePositionSnapshotsUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to persist taxi position snapshot`, async () => {
    const [dtoTaxiPositionSnapShot, apiKey] = await getValidTaxiPositionSnapshotDtoAndApikey(role);
    const response = await postTaxiPositionSnapshots(dtoTaxiPositionSnapShot, apiKey);
    assert.strictEqual(response.status, StatusCodes.OK);
  });
}
