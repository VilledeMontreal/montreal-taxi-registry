// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { pingController } from './ping.controller';

export function getPingRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/ping/'),
      handler: pingController.getPing
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/ping-heavy/'),
      handler: pingController.getPingHeavy
    }
  ];
}
