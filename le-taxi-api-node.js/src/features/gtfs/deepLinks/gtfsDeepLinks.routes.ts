// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../../models/route.model';
import { buildApiEndpoint } from '../../shared/utils/apiUtils';
import { gtfsDeepLinksController } from './gtfDeepLinks.controller';

export function getGtfsDeepLinksRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/users/:id/gtfs-url-scheme-acceptance-test'),
      handler: gtfsDeepLinksController.getDeepLinksForId
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/current-user/gtfs-url-scheme-acceptance-test'),
      handler: gtfsDeepLinksController.getDeepLinksForCurrentUser
    }
  ];
}
