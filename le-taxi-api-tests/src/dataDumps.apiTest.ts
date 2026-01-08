// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { crudDriversCsvTests } from "./driversCsv/crudDriversCsv.apiTest";
import { invalidDriversCsvTests } from "./driversCsv/invalidDriversCsv.apiTest";
import { crudRoleDataDumpsTests } from "./roleDataDumps/crudRoleDataDumps.apiTest";
import { invalidRoleDataDumpsTests } from "./roleDataDumps/invalidRoleDataDumps.apiTest";
import { crudTaxiCsvTests } from "./taxiCsv/crudTaxiCsv.apiTest";
import { invalidTaxiCsvTests } from "./taxiCsv/invalidTaxiCsv.apiTest";
import { crudTaxiDataDumpsTests } from "./taxiDataDumps/crudTaxiDataDumps.apiTest";
import { invalidTaxiDataDumpsTests } from "./taxiDataDumps/invalidTaxiDataDumps.apiTest";
import { crudTaxiPositionSnapshotDataDumpsTests } from "./taxiPositionSnapshotDataDumps/crudTaxiPositionSnapshotDataDumps.apiTest";
import { invalidTaxiPositionSnapshotDataDumpsTests } from "./taxiPositionSnapshotDataDumps/invalidTaxiPositionSnapshotDataDumps.apiTest";
import { crudUserDataDumpsTests } from "./userDataDumps/crudUserDataDumps.apiTest";
import { invalidUserDataDumpsTests } from "./userDataDumps/invalidUserDataDumps.apiTest";
import { crudVehicleDataDumpsTests } from "./vehicleDataDumps/crudVehicleDataDumps.apiTest";
import { invalidVehicleDataDumpsTests } from "./vehicleDataDumps/invalidVehicleDataDumps.apiTest";
import { crudVehiclesCsvTests } from "./vehiclesCsv/crudVehiclesCsv.apiTest";
import { invalidVehiclesCsvTests } from "./vehiclesCsv/invalidVehiclesCsv.apiTest";

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
  crudRoleDataDumpsTests();
  invalidRoleDataDumpsTests();
  crudUserDataDumpsTests();
  invalidUserDataDumpsTests();
  crudTaxiPositionSnapshotDataDumpsTests();
  invalidTaxiPositionSnapshotDataDumpsTests();
}
