// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { mapController } from "./map.controller";

export function getMapRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/taxi-positions"),
      handler: mapController.getLatestTaxiPositions,
    },
  ];
}
