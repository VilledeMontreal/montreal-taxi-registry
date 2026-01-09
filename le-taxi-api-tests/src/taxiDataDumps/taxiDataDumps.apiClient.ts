// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { getTaxiRegistry } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";

export async function getTaxiDataDump(
  operator: string,
  apiKey?: string,
  eTag?: string,
) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Stats);
  const queryParams = operator ? `operator=${operator}` : "";
  return await getTaxiRegistry(
    "/api/data-dumps/taxis" + (queryParams ? `?${queryParams}` : ""),
    apiKey,
    defaultApiKey,
    eTag,
    true,
  );
}
