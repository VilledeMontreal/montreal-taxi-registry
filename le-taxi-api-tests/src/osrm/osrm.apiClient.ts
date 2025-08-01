// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Response } from "superagent";
import { configs } from "../../config/configs";
import { constants } from "../../config/constants";
import { ICoordinates } from "../shared/coordinates/coordinates";
import { superagentWithStats } from "../shared/e2eTesting/superagentWithStats";

export async function getRoutesFromTaxiRegistryOsrm(
  closestTaxi: ICoordinates,
  from: ICoordinates,
  to: ICoordinates
): Promise<Response> {
  const { base, domainPath } = configs.taxiRegistryOsrmApi;

  const params = `overview=false&alternatives=false`;
  const cityInternalOsrmUrl = `${base}${domainPath}/${constants.osrm.profile.ROUTE}/${closestTaxi.lon},${closestTaxi.lat};${from.lon},${from.lat};${to.lon},${to.lat}?${params}`;

  return await superagentWithStats.get(cityInternalOsrmUrl);
}
