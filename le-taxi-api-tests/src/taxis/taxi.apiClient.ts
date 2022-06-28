// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from '../shared/commonTests/UserRole';
import { ITaxi } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getTaxiRegistry, postTaxiRegistry, putTaxiRegistry } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';

export async function postTaxi(dto: ITaxi, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await postTaxiRegistry('/api/taxis/', dto, apiKey, defaultApiKey);
}

export async function putTaxi(dto: any, taxiId: string, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  return putTaxiRegistry(`/api/taxis/${taxiId}`, dto, apiKey, defaultApiKey);
}

export async function getTaxiById(id: string, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  return getTaxiRegistry(`/api/taxis/${id}`, apiKey, defaultApiKey);
}
