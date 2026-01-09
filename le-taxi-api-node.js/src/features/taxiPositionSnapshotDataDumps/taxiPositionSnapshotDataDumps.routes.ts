// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { taxiPositionSnapshotDataDumpsController } from "./taxiPositionSnapshotDataDumps.controller";

export function getTaxiPositionSnapshotDataDumpsRoutes(): IHandlerRoute[] {
  return [
    {
      // The route is defined with an optional date `:date?` so that express router is able
      // to route to /api/data-dumps/taxi-positions when no date is provided.
      // Using a question mark will allow to reach that endpoint with an undefined date
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/data-dumps/taxi-positions/{:date}"),
      handler:
        taxiPositionSnapshotDataDumpsController.getTaxiPositionSnapshotDataDumps,
    },
  ];
}
