// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import { createTaxiWithStatus } from "../taxiPositionSnapShots/taxiPositionSnapshots.fixture";
import {
  createNonImmutableUser,
  getImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import { postVehicle } from "../vehicles/vehicle.apiClient";
import { copyVehicleTemplate } from "../vehicles/vehiclesDto.template";
import { getVehicleDataDump } from "./vehicleDataDumps.apiClient";

export async function crudVehicleDataDumpsTests(): Promise<void> {
  testVehicleDataDumpsAccessValid(UserRole.Admin);
  testVehicleDataDumpsAccessValid(UserRole.Manager);
  testVehicleDataDumpsAccessValid(UserRole.Stats);

  it("Always returns same value for obsolete properties on vehicle data-dump", async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    await createTaxiWithStatus("free", newOperator.apikey);
    await createTaxiWithStatus("oncoming", newOperator.apikey);
    await createTaxiWithStatus("answering", newOperator.apikey);

    const responseDataDump = await getVehicleDataDump(newOperator.email);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
    responseDataDump.body.forEach((element: any) => {
      assert.strictEqual(element.status, "off");
      assert.strictEqual(element.private, false);
    });
  });

  it("Return vehicle data on outdated etag", async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    const dtoCreate = copyVehicleTemplate();

    const dataDumpResponse = await getVehicleDataDump(newOperator.email);
    assert.strictEqual(dataDumpResponse.status, StatusCodes.OK);

    const createResponse = await postVehicle(dtoCreate, newOperator.apikey);
    assert.strictEqual(createResponse.status, StatusCodes.CREATED);

    const dataDumpResponseWithEtag = await getVehicleDataDump(
      newOperator.email,
      null,
      dataDumpResponse.get("etag"),
    );
    assert.strictEqual(dataDumpResponseWithEtag.status, StatusCodes.OK);
  });
}

function testVehicleDataDumpsAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access vehicle data dumps `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getVehicleDataDump(operator.email, apiKey);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}
