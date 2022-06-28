// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
/* tslint:disable: no-floating-promises */
import { crudAdsTests } from './ads/crudAds.apiTest';
import { invalidAdsTests } from './ads/invalidAds.apiTest';
import { crudDriverTests } from './drivers/crudDriver.apiTest';
import { invalidDriverTests } from './drivers/invalidDriver.apiTest';
import { crudHailTests } from './hails/crudHail.apiTest';
import { hailOperatorTests } from './hails/hailOperator.apiTest';
import { invalidHailTests } from './hails/invalidHail.apiTest';
import { crudInquiryTests } from './inquiry/crudInquiry.apiTest';
import { invalidInquiryTests } from './inquiry/invalidInquiry.apiTest';
import { invalidJsonTests } from './json/invalidJson.apiTest';
import { crudLatestTaxiPositionTests } from './latestTaxiPositions/crudLatestTaxiPosition.apiTest';
import { invalidLatestTaxiPositionTests } from './latestTaxiPositions/invalidLatestTaxiPosition.apiTest';
import { crudMapTests } from './map/crudMap.apiTest';
import { invalidMapTests } from './map/invalidMap.apiTest';
import { crudOsrmTests } from './osrm/crudOsrm.apiTest';
import { invalidOsrmTests } from './osrm/invalidOsrm.apiTest';
import { timeSlotTests } from './shared/dataDumps/timeSlot.apiTest';
import { crudTaxiPositionSnapShotsTests } from './taxiPositionSnapShots/crudTaxiPositionSnapShots.apiTest';
import { invalidTaxiPositionSnapShotsTests } from './taxiPositionSnapShots/invalidTaxiPositionSnapShots.apiTest';
import { crudTaxiTests } from './taxis/crudTaxi.apiTest';
import { invalidTaxiTests } from './taxis/invalidTaxi.apiTest';
import { crudUserTests } from './users/crudUser.apiTest';
import { invalidApiKeyTests } from './users/invalidApiKey.apiTest';
import { invalidUserTests } from './users/invalidUser.apiTest';
import { crudVehicleTests } from './vehicles/crudVehicle.apiTest';
import { invalidVehicleTests } from './vehicles/invalidVehicle.apiTest';

export function commonTests() {
  crudAdsTests();
  crudDriverTests();
  crudHailTests();
  crudOsrmTests();
  crudInquiryTests();
  crudLatestTaxiPositionTests();
  crudMapTests();
  crudTaxiPositionSnapShotsTests();
  crudTaxiTests();
  crudUserTests();
  crudVehicleTests();
  hailOperatorTests();
  invalidAdsTests();
  invalidApiKeyTests();
  invalidDriverTests();
  invalidHailTests();
  invalidInquiryTests();
  invalidJsonTests();
  invalidLatestTaxiPositionTests();
  invalidMapTests();
  invalidOsrmTests();
  invalidTaxiPositionSnapShotsTests();
  invalidTaxiTests();
  invalidUserTests();
  invalidVehicleTests();
  timeSlotTests();
}
