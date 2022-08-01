// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as _ from 'lodash';
import { IHandlerRoute } from '../models/route.model';
import { getAdsRoutes } from './ads/ads.routes';
import { getAdsDataDumpsRoutes } from './adsDataDumps/adsDataDumps.routes';
import { getDriverDataDumpsRoutes } from './driverDataDumps/driverDataDumps.routes';
import { getDriversRoutes } from './drivers/driver.routes';
import { getTaxiPathRoutes } from './exportTaxiPath/taxiPath.route';
import { getGtfsDeepLinksRoutes } from './gtfsDeepLinks/gtfsDeepLinks.routes';
import { getHailAnonymizationRoutes } from './hailAnonymization/hail-anonymization.route';
import { getHailDataDumpsRoutes } from './hailDataDumps/hailDataDumps.routes';
import { getHailFakeDataDumpRoutes } from './hailFakeDataDump/hail-fake-data-dump.route';
import { getHailRoutes } from './hails/hail.routes';
import { getInquiryRoutes } from './inquiry/inquiry.routes';
import { getMapRoutes } from './map/map.routes';
import { getPingRoutes } from './ping/ping.routes';
import { getRolesDataDumpRoutes } from './roleDataDumps/roleDataDumps.routes';
import { getTaxiAreasRoutes } from './taxiAreas/taxiAreas.routes';
import { getTaxiDataDumpsRoutes } from './taxiDataDumps/taxiDataDumps.routes';
import { getTaxiPositionSnapshotRoutes } from './taxiPositionSnapshot/taxiPositionSnapshot.routes';
import { getTaxiPositionSnapshotDataDumpsRoutes } from './taxiPositionSnapshotDataDumps/taxiPositionSnapshotDataDumps.routes';
import { getTaxisRoutes } from './taxis/taxi.routes';
import { getTripsRoutes } from './trips/trip.routes';
import { getUsersDataDumpRoutes } from './userDataDumps/userDataDumps.routes';
import { getUsersRoutes } from './users/user.routes';
import { getVehicleDataDumpsRoutes } from './vehicleDataDumps/vehicleDataDumps.routes';
import { getVehiclesRoutes } from './vehicles/vehicle.routes';

export function getFeaturesRoutes(): IHandlerRoute[] {
  return flattenRoutes(
    // Api
    getUsersRoutes(),
    getAdsDataDumpsRoutes(),
    getAdsRoutes(),
    getDriverDataDumpsRoutes(),
    getDriversRoutes(),
    getGtfsDeepLinksRoutes(),
    getHailAnonymizationRoutes(),
    getHailDataDumpsRoutes(),
    getHailFakeDataDumpRoutes(),
    getHailRoutes(),
    getInquiryRoutes(),
    getMapRoutes(),
    getPingRoutes(),
    getRolesDataDumpRoutes(),
    getTaxiAreasRoutes(),
    getTaxiDataDumpsRoutes(),
    getTaxiPathRoutes(),
    getTaxiPositionSnapshotDataDumpsRoutes(),
    getTaxisRoutes(),
    getTripsRoutes(),
    getUsersDataDumpRoutes(),
    getVehicleDataDumpsRoutes(),
    getVehiclesRoutes(),
    // GeoServer
    getTaxiPositionSnapshotRoutes()
  );
}

function flattenRoutes(...featureRoutes: IHandlerRoute[][]) {
  return _.flatten(featureRoutes);
}
