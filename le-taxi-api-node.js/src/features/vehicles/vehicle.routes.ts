// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { vehiclesController } from "./vehicle.controller";

export function getVehiclesRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint("/api/vehicles/"),
      handler: vehiclesController.upsertVehicles,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/vehicles"),
      handler: vehiclesController.getVehicles,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/vehicles/count"),
      handler: vehiclesController.getVehiclesCount,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/vehicles/csv"),
      handler: vehiclesController.getVehiclesCsv,
    },
  ];
}
