// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { taxiController } from "./taxi.controller";

export function getTaxisRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/taxis/:id"),
      handler: taxiController.getTaxiById,
    },
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint("/api/taxis/"),
      handler: taxiController.upsertTaxis,
    },
    {
      method: HttpMethods.PUT,
      path: buildApiEndpoint("/api/taxis/:id"),
      handler: taxiController.updateTaxi,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/taxis/grid"),
      handler: taxiController.getTaxis,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/taxis/count"),
      handler: taxiController.getTaxisCount,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/taxis/csv"),
      handler: taxiController.getTaxisCsv,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/legacy-web/taxis/actif"),
      handler: taxiController.getTaxisActif,
    },
  ];
}
