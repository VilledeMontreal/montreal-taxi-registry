// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from '../shared/commonTests/UserRole';
import { getTaxiRegistry } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';

const tenMinutesInMs = 1000 * 60 * 10;

export async function getTaxiPositionSnapshotDataDump(timeStamp: string, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Stats);
  return await getTaxiRegistry(`/api/data-dumps/taxi-positions/${timeStamp}`, apiKey, defaultApiKey, null, true);
}

export function getCurrentTaxiPositionTimestamp() {
  const now = Date.now();
  const tenMinutesRemainder = now % tenMinutesInMs;
  const roundedUp = now - tenMinutesRemainder + tenMinutesInMs;
  return new Date(roundedUp).toISOString();
}
