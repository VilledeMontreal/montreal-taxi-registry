// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { tripController } from "./trip.controller";

export function getTripsRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint("/api/worker/taxi-trip-anonymization-tasks/"),
      handler: tripController.extractAndAnonymize,
    },
  ];
}
