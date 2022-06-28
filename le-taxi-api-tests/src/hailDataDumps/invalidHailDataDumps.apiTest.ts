// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { untilNextHailTimeSlotStarts } from '../hails/hail.fixture';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getHailDataDumps } from './hailDataDumps.apiClient';

export async function invalidHailDataDumpsTests(): Promise<void> {
  testGetDataDumpUserAccessInvalid(UserRole.Prefecture);
  testGetDataDumpUserAccessInvalid(UserRole.Operator);
  testGetDataDumpUserAccessInvalid(UserRole.Inspector);
  testGetDataDumpUserAccessInvalid(UserRole.Motor);

  it('Should return 400 error (Date before hail-epoch)', async () => {
    const date = '2019-06-30T23:50:00.000Z';
    await shouldThrow(
      () => getHailDataDumps(date),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'There are no hails prior to');
      }
    );
  });

  it('Should return 400 error (Date to far into the future)', async () => {
    const date = '2030-06-30T23:50:00.000Z';
    await shouldThrow(
      () => getHailDataDumps(date),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'This timeslot is not over yet.');
      }
    );
  });

  it('Should return 400 error (does not match the data dumb period)', async () => {
    const date = '2020-07-30T23:00:01.000Z';
    await shouldThrow(
      () => getHailDataDumps(date),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'does not match the data dumb period');
      }
    );
  });

  it('Should return 400 error (Wrong date format)', async () => {
    const date = '2019-07-22T11:40:00.00000000';
    await shouldThrow(
      () => getHailDataDumps(date),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The expected date format is: AAAA-MM-JJThh:mm:ss.nnnZ');
      }
    );
  });

  it('Should return 400 error, Current period', async () => {
    const timeSlot = await untilNextHailTimeSlotStarts();
    await shouldThrow(
      () => getHailDataDumps(timeSlot.startsAt),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'This timeslot is not over yet.');
      }
    );
  });
}

function testGetDataDumpUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to get a Data Dump`, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    const date = '2020-07-03T20:40:00.000Z';
    await shouldThrow(
      () => getHailDataDumps(date, apiKey),
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
