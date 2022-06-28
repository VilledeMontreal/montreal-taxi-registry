// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { hailDataDumpsController } from './hailDataDumps.controller';

export function getHailDataDumpsRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/data-dumps/hails/:timeSlot'),
      handler: hailDataDumpsController.getHailDataDumps
    }
  ];
}
