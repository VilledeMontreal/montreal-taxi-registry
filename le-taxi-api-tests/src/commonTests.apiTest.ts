// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { crudAdsTests } from "./ads/crudAds.apiTest";
import { invalidAdsTests } from "./ads/invalidAds.apiTest";
import { crudDriverTests } from "./drivers/crudDriver.apiTest";
import { invalidDriverTests } from "./drivers/invalidDriver.apiTest";
import { crudGofsLiteTests } from "./gofsLite/crudGofsLite.apiTest";
import { crudGtfsDeepLinksTests } from "./gtfsDeepLinks/crudGtfsDeepLinks.apiTest";
import { invalidGtfsDeepLinksTests } from "./gtfsDeepLinks/invalidGtfsDeepLinks.apiTest";
import { crudGtfsInquiryTests } from "./gtfsInquiry/crudGtfsInquiry.apiTest";
import { invalidGtfsInquiryTests } from "./gtfsInquiry/invalidGtfsInquiry.apiTest";
import { invalidJsonTests } from "./json/invalidJson.apiTest";
import { crudLatestTaxiPositionTests } from "./latestTaxiPositions/crudLatestTaxiPosition.apiTest";
import { invalidLatestTaxiPositionTests } from "./latestTaxiPositions/invalidLatestTaxiPosition.apiTest";
import { crudMapTests } from "./map/crudMap.apiTest";
import { invalidMapTests } from "./map/invalidMap.apiTest";
import { crudOsrmTests } from "./osrm/crudOsrm.apiTest";
import { invalidOsrmTests } from "./osrm/invalidOsrm.apiTest";
import { crudTaxiAreasTests } from "./taxiAreas/crudTaxiAreas.apiTest";
import { invalidTaxiAreasTests } from "./taxiAreas/invalidTaxiAreas.apiTest";
import { crudTaxiPositionSnapShotsTests } from "./taxiPositionSnapShots/crudTaxiPositionSnapShots.apiTest";
import { invalidTaxiPositionSnapShotsTests } from "./taxiPositionSnapShots/invalidTaxiPositionSnapShots.apiTest";
import { crudTaxiTests } from "./taxis/crudTaxi.apiTest";
import { invalidTaxiTests } from "./taxis/invalidTaxi.apiTest";
import { crudUserTests } from "./users/crudUser.apiTest";
import { invalidApiKeyTests } from "./users/invalidApiKey.apiTest";
import { invalidUserTests } from "./users/invalidUser.apiTest";
import { crudVehicleTests } from "./vehicles/crudVehicle.apiTest";
import { invalidVehicleTests } from "./vehicles/invalidVehicle.apiTest";

export function commonTests() {
  crudAdsTests();
  crudDriverTests();
  crudGtfsDeepLinksTests();
  crudOsrmTests();
  crudGtfsInquiryTests();
  crudGofsLiteTests();
  crudLatestTaxiPositionTests();
  crudMapTests();
  crudTaxiPositionSnapShotsTests();
  crudTaxiTests();
  crudTaxiAreasTests();
  crudUserTests();
  crudVehicleTests();
  invalidAdsTests();
  invalidApiKeyTests();
  invalidDriverTests();
  invalidGtfsDeepLinksTests();
  invalidGtfsInquiryTests();
  invalidJsonTests();
  invalidLatestTaxiPositionTests();
  invalidMapTests();
  invalidOsrmTests();
  invalidTaxiPositionSnapShotsTests();
  invalidTaxiTests();
  invalidTaxiAreasTests();
  invalidUserTests();
  invalidVehicleTests();
}
