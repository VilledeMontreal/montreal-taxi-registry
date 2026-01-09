// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { getTaxiAttachedCsv } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";

export async function getTaxiCsv(operator: string, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Manager);
  const queryParams = operator ? `operator=${operator}` : "";
  return getTaxiAttachedCsv(
    "/api/legacy-web/taxis/csv" + (queryParams ? `?${queryParams}` : ""),
    apiKey,
    defaultApiKey,
  );
}
