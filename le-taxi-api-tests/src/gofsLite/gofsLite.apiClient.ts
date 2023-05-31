// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from '../shared/commonTests/UserRole';
import { getTaxiRegistry, postTaxiRegistry } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';

export async function postGofsLite(dto: any, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await postTaxiRegistry('/api/gofs-lite/1/en/wait_time', dto, apiKey, defaultApiKey);
}

export async function getFeed(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry('/api/gofs-lite/', apiKey, defaultApiKey);
}
