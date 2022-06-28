// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from '../shared/commonTests/UserRole';
import {
  IHail,
  IHailIncidentTaxiReason,
  IHailRating,
  IHailReportingCustomer,
  IHailStatus,
  IHailTaxiPhoneNumber
} from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getTaxiRegistry, postTaxiRegistry, putTaxiRegistry } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';

export async function postHail(dto: IHail, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await postTaxiRegistry('/api/hails/', dto, apiKey, defaultApiKey);
}

export async function putHail(
  dto: IHailStatus | IHailRating | IHailReportingCustomer | IHailTaxiPhoneNumber | IHailIncidentTaxiReason,
  hailId: string,
  apiKey?: string
) {
  return await putTaxiRegistry(`/api/hails/${hailId}`, dto, apiKey, null);
}

export async function getHail(hailId: string, apiKey?: string) {
  return await getTaxiRegistry(`/api/hails/${hailId}`, apiKey, null);
}

export async function postOperatorToolsHail(dto: IHail) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await postTaxiRegistry('/api/operator-integration-tools/hails-as-motor', dto, null, defaultApiKey);
}

export async function putOperatorToolsHail(dto: IHailStatus, hailId: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  return await putTaxiRegistry(`/api/operator-integration-tools/hails-as-motor/${hailId}`, dto, null, defaultApiKey);
}
