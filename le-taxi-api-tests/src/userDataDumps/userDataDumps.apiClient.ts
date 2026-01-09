// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { getTaxiRegistry } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";

export async function getUserDataDump(
  operator: string,
  apiKey?: string,
  eTag?: string,
) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Manager);
  const queryParams = operator ? `operator=${operator}` : "";
  return await getTaxiRegistry(
    "/api/data-dumps/users" + (queryParams ? `?${queryParams}` : ""),
    apiKey,
    defaultApiKey,
    eTag,
    true,
  );
}
