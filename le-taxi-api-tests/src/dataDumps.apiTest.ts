// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
/* tslint:disable: no-floating-promises */
import { crudDriversCsvTests } from './driversCsv/crudDriversCsv.apiTest';
import { invalidDriversCsvTests } from './driversCsv/invalidDriversCsv.apiTest';
import { crudTaxiCsvTests } from './taxiCsv/crudTaxiCsv.apiTest';
import { invalidTaxiCsvTests } from './taxiCsv/invalidTaxiCsv.apiTest';
import { crudTaxiDataDumpsTests } from './taxiDataDumps/crudTaxiDataDumps.apiTest';
import { invalidTaxiDataDumpsTests } from './taxiDataDumps/invalidTaxiDataDumps.apiTest';
import { crudTaxiPositionSnapshotDataDumpsTests } from './taxiPositionSnapshotDataDumps/crudTaxiPositionSnapshotDataDumps.apiTest';
import { invalidTaxiPositionSnapshotDataDumpsTests } from './taxiPositionSnapshotDataDumps/invalidTaxiPositionSnapshotDataDumps.apiTest';
import { crudVehicleDataDumpsTests } from './vehicleDataDumps/crudVehicleDataDumps.apiTest';
import { invalidVehicleDataDumpsTests } from './vehicleDataDumps/invalidVehicleDataDumps.apiTest';
import { crudVehiclesCsvTests } from './vehiclesCsv/crudVehiclesCsv.apiTest';
import { invalidVehiclesCsvTests } from './vehiclesCsv/invalidVehiclesCsv.apiTest';

export function dataDumpsTests() {
  crudDriversCsvTests();
  invalidDriversCsvTests();
  crudVehiclesCsvTests();
  invalidVehiclesCsvTests();
  crudTaxiCsvTests();
  invalidTaxiCsvTests();
  crudVehicleDataDumpsTests();
  invalidVehicleDataDumpsTests();
  crudTaxiDataDumpsTests();
  invalidTaxiDataDumpsTests();
  crudTaxiPositionSnapshotDataDumpsTests();
  invalidTaxiPositionSnapshotDataDumpsTests();
}
