// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { gofsLiteController } from './gofsLite.controller';

export function getGofsLiteRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/gofs-lite/1/:lang/wait_time'),
      handler: gofsLiteController.postWaitTime
    }
  ];
}
