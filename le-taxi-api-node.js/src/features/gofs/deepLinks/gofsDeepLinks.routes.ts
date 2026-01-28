// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../../models/route.model";
import { buildApiEndpoint } from "../../shared/utils/apiUtils";
import { gofsDeepLinksController } from "./gofsDeepLinks.controller";

export function getGofsDeepLinksRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/users/:id/gofs-url-scheme-acceptance-test"),
      handler: gofsDeepLinksController.getDeepLinksForId,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint(
        "/api/current-user/gofs-url-scheme-acceptance-test",
      ),
      handler: gofsDeepLinksController.getDeepLinksForCurrentUser,
    },
  ];
}
