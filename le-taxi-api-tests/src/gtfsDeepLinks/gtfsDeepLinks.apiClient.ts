// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { downloadFile } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";

export async function getGtfsDeepLinks(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Operator);
  const response = await downloadFile(
    "/api/current-user/gtfs-url-scheme-acceptance-test",
    "",
    apiKey,
    defaultApiKey
  );
  return response;
}
