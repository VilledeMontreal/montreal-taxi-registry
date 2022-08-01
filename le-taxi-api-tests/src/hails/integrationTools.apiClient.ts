// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getIntegrationToolCoordinates } from '../shared/commonLoadTests/specialRegion';
import { UserRole } from '../shared/commonTests/UserRole';
import { getTaxiRegistry } from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';

export async function taxiSearchIntegrationTool(apiKey?: string) {
  const { lat, lon } = getIntegrationToolCoordinates();
  const url = `/api/motor-integration-tools/taxis?lat=${lat}&lon=${lon}`;

  const defaultApiKey = await getImmutableUserApiKey(UserRole.Motor);
  return await getTaxiRegistry(url, apiKey, defaultApiKey);
}
