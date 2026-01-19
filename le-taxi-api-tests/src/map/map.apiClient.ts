// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserRole } from "../shared/commonTests/UserRole";
import { getTaxiRegistry } from "../shared/taxiRegistryHttp/taxiRegistryHttp";
import { getImmutableUserApiKey } from "../users/user.sharedFixture";

export async function getTaxiOperators(apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Inspector);
  return await getTaxiRegistry(
    "/api/legacy-web/taxi-operators",
    apiKey,
    defaultApiKey,
  );
}

export async function getTaxiData(idTaxi?: string, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Inspector);
  const queryParams = idTaxi ? `idTaxi=${idTaxi}` : "";
  return await getTaxiRegistry(
    "/api/legacy-web/taxi-data" + (queryParams ? `?${queryParams}` : ""),
    apiKey,
    defaultApiKey,
  );
}

export async function getTaxiSearch(
  licencePlate?: string,
  professionalLicence?: string,
  apiKey?: string,
) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Inspector);
  const queryParams = licencePlate
    ? `licencePlate=${licencePlate}`
    : professionalLicence
      ? `professionalLicence=${professionalLicence}`
      : "";
  return await getTaxiRegistry(
    "/api/legacy-web/taxi-search" + (queryParams ? `?${queryParams}` : ""),
    apiKey,
    defaultApiKey,
  );
}
