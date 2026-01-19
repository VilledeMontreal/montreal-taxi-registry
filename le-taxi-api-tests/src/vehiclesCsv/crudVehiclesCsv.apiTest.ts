// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../shared/commonTests/UserRole";
import {
  createNonImmutableUser,
  getImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import { createVehicle } from "../vehicles/vehicle.apiClient";
import { getVehiclesCsv } from "./vehiclesCsv.apiClient";

const expectedColumnNames = [
  "LICENCE_PLATE",
  "ADDED_AT",
  "ADDED_VIA",
  "SOURCE",
  "LAST_UPDATE_AT",
  "ID",
  "MODEL_YEAR",
  "ENGINE",
  "HORSE_POWER",
  "RELAIS",
  "HORODATEUR",
  "TAXIMETRE",
  "DATE_DERNIER_CT",
  "DATE_VALIDITE_CT",
  "SPECIAL_NEED_VEHICLE",
  "TYPE_",
  "LUXURY",
  "CREDIT_CARD_ACCEPTED",
  "NFC_CC_ACCEPTED",
  "AMEX_ACCEPTED",
  "BANK_CHECK_ACCEPTED",
  "FRESH_DRINK",
  "DVD_PLAYER",
  "TABLET",
  "WIFI",
  "BABY_SEAT",
  "BIKE_ACCEPTED",
  "PET_ACCEPTED",
  "AIR_CON",
  "BONJOUR",
  "ELECTRONIC_TOLL",
  "GPS",
  "CPAM_CONVENTIONNE",
  "EVERY_DESTINATION",
  "COLOR",
  "ADDED_BY",
  "NB_SEATS",
  "LAST_NONSTATUS_UPDATE_AT",
  "MODELNAME",
  "CONSTRUCTORNAME",
  "ADDED_BY_NAME",
];

export async function crudVehiclesCsvTests(): Promise<void> {
  testVehiclesCsvAccessValid(UserRole.Admin);
  testVehiclesCsvAccessValid(UserRole.Manager);
  testVehiclesCsvAccessValid(UserRole.Inspector);

  it("Vehicles CSV file conforms to all columns name and position", async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    await createVehicle(newOperator.apikey);

    const apiKey = await getImmutableUserApiKey(UserRole.Manager);
    const responseCsv = await getVehiclesCsv(newOperator.email, apiKey);
    assert.strictEqual(responseCsv.status, StatusCodes.OK);
    const responseLines = responseCsv.text.split("\r\n");
    const responseColumnNames = responseLines[0].split(";");
    if (responseColumnNames[responseColumnNames.length - 1] === "") {
      responseColumnNames.pop();
    }

    assert.isTrue(
      areColumnNamesIdentical(expectedColumnNames, responseColumnNames),
    );
  });
}

function testVehiclesCsvAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access Vehicles CSV file`, async () => {
    const operator = await getImmutableUser(UserRole.Operator);

    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getVehiclesCsv(operator.email, apiKey);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}

function areColumnNamesIdentical(a: string[], b: string[]): boolean {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}
