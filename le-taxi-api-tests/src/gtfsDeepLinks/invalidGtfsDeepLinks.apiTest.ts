// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getGtfsDeepLinks } from './gtfsDeepLinks.apiClient';

// tslint:disable-next-line: max-func-body-length
export async function invalidGtfsDeepLinksTests(): Promise<void> {
  testGtfsDeepLinksAccessInvalid(UserRole.Admin);
  testGtfsDeepLinksAccessInvalid(UserRole.Motor);
  testGtfsDeepLinksAccessInvalid(UserRole.Inspector);
  testGtfsDeepLinksAccessInvalid(UserRole.Manager);
  testGtfsDeepLinksAccessInvalid(UserRole.Stats);
  testGtfsDeepLinksAccessInvalid(UserRole.Prefecture);
}

function testGtfsDeepLinksAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access the Gtfs deep link acceptance test page`, async () => {
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () => getGtfsDeepLinks(apiKey),
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
