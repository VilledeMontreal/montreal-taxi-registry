// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as _ from "lodash";
import { IHandlerRoute } from "../models/route.model";
import { getAdsRoutes } from "./ads/ads.routes";
import { getAdsDataDumpsRoutes } from "./adsDataDumps/adsDataDumps.routes";
import { getDriverDataDumpsRoutes } from "./driverDataDumps/driverDataDumps.routes";
import { getDriversRoutes } from "./drivers/driver.routes";
import { getTaxiPathRoutes } from "./exportTaxiPath/taxiPath.route";
import { getGofsLiteRoutes } from "./gofsLite/gofsLite.routes";
import { getGtfsDeepLinksRoutes } from "./gtfs/deepLinks/gtfsDeepLinks.routes";
import { getGtfsFeedRoutes } from "./gtfs/feed/gtfsFeed.routes";
import { getGtfsInquiryRoutes } from "./gtfs/inquiry/gtfsInquiry.routes";
import { getMapRoutes } from "./map/map.routes";
import { getRolesDataDumpRoutes } from "./roleDataDumps/roleDataDumps.routes";
import { getTaxiAreasRoutes } from "./taxiAreas/taxiAreas.routes";
import { getTaxiDataDumpsRoutes } from "./taxiDataDumps/taxiDataDumps.routes";
import { getTaxiPositionSnapshotRoutes } from "./taxiPositionSnapshot/taxiPositionSnapshot.routes";
import { getTaxiPositionSnapshotDataDumpsRoutes } from "./taxiPositionSnapshotDataDumps/taxiPositionSnapshotDataDumps.routes";
import { getTaxisRoutes } from "./taxis/taxi.routes";
import { getTripsRoutes } from "./trips/trip.routes";
import { getUsersDataDumpRoutes } from "./userDataDumps/userDataDumps.routes";
import { getUsersRoutes } from "./users/user.routes";
import { getVehicleDataDumpsRoutes } from "./vehicleDataDumps/vehicleDataDumps.routes";
import { getVehiclesRoutes } from "./vehicles/vehicle.routes";

export function getFeaturesRoutes(): IHandlerRoute[] {
  return flattenRoutes(
    // Api
    getUsersRoutes(),
    getAdsDataDumpsRoutes(),
    getAdsRoutes(),
    getDriverDataDumpsRoutes(),
    getDriversRoutes(),
    getGtfsDeepLinksRoutes(),
    getGtfsFeedRoutes(),
    getGtfsInquiryRoutes(),
    getGofsLiteRoutes(),
    getMapRoutes(),
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
