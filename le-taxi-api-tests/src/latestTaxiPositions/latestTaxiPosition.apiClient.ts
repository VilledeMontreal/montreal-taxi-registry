// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { getTaxiRegistry } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";

export async function getLatestTaxiPositions(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Inspector);
  return await getTaxiRegistry(
    "/api/legacy-web/taxi-positions",
    apiKey,
    defaultApiKey
  );
}
