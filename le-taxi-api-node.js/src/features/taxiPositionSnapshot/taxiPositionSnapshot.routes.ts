// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { taxiPositionSnapshotController } from './taxiPositionSnapshot.controller';

export function getTaxiPositionSnapshotRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/taxi-position-snapshots'),
      handler: taxiPositionSnapshotController.addTaxiPositionSnapshot
    }
  ];
}
