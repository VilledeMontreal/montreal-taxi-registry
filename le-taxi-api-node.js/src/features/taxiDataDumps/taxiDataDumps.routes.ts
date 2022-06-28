// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { taxiDataDumpsController } from './taxiDataDumps.controller';

export function getTaxiDataDumpsRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/data-dumps/taxis'),
      handler: taxiDataDumpsController.getTaxiDataDumps
    }
  ];
}
