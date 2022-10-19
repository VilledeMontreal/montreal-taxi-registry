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
    },
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/taxi-position-snapshots-empty'),
      handler: taxiPositionSnapshotController.addTaxiPositionSnapshotEmpty
    },
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/taxi-position-snapshots-validations'),
      handler: taxiPositionSnapshotController.addTaxiPositionSnapshotValidations
    },
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/taxi-position-snapshots-mongo-read'),
      handler: taxiPositionSnapshotController.addTaxiPositionSnapshotMongoRead
    },
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/taxi-position-snapshots-mongo-write'),
      handler: taxiPositionSnapshotController.addTaxiPositionSnapshotMongoWrite
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/taxi-position-snapshots-get-empty'),
      handler: taxiPositionSnapshotController.addTaxiPositionSnapshotGetEmpty
    },
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/taxi-position-snapshots-post-empty'),
      handler: taxiPositionSnapshotController.addTaxiPositionSnapshotPostEmpty
    }
  ];
}
