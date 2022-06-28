// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from '../shared/commonTests/UserRole';
import { getTaxiRegistry } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';

export async function getHailDataDumps(timeSlot: string, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Stats);

  return await getTaxiRegistry(`/api/data-dumps/hails/${timeSlot}`, apiKey, defaultApiKey, null, true);
}
