// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { driverController } from "./driver.controller";

export function getDriversRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint("/api/drivers"),
      handler: driverController.upsertDrivers,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/drivers"),
      handler: driverController.getDrivers,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/drivers/count"),
      handler: driverController.getDriversCount,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/drivers/csv"),
      handler: driverController.getDriversCsv,
    },
  ];
}
