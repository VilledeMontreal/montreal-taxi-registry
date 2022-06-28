// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { taxiAreasController } from './taxiAreas.controller';

export function getTaxiAreasRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/legacy-web/taxi-areas/'),
      handler: taxiAreasController.getTaxiAreas
    }
  ];
}
