// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../../models/route.model';
import { buildApiEndpoint } from '../../shared/utils/apiUtils';
import { gtfsFeedController } from './gtfsFeed.controller';

export function getGtfsFeedRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/taxi-registry-gtfs-feed'),
      handler: gtfsFeedController.getGtfsFeed
    }
  ];
}
