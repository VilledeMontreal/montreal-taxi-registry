// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { usersDataDumpController } from "./userDataDumps.controller";

export function getUsersDataDumpRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/data-dumps/users"),
      handler: usersDataDumpController.getUserDataDumps,
    },
  ];
}
