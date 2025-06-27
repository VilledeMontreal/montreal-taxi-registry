// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "../shared/commonTests/UserRole";
import { setupNewTaxi } from "../taxis/taxi.fixture";
import { copyTaxiTemplate } from "../taxis/taxisDto.template";
import {
  createNonImmutableUser,
  getImmutableUser,
  getImmutableUserApiKey,
} from "../users/user.sharedFixture";
import { getTaxiDataDump } from "./taxiDataDumps.apiClient";

// eslint-disable-next-line max-lines-per-function
export async function crudTaxiDataDumpsTests(): Promise<void> {
  testTaxiDataDumpsAccessValid(UserRole.Admin);
  testTaxiDataDumpsAccessValid(UserRole.Manager);
  testTaxiDataDumpsAccessValid(UserRole.Stats);

  it("Contains property private", async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate((x) => {
      x.data[0].private = false;
    });
    const response = await setupNewTaxi(dtoCreate, newOperator.apikey);
    assert.strictEqual(response.status, StatusCodes.CREATED);

    const responseDataDump = await getTaxiDataDump(newOperator.email);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
    responseDataDump.body.forEach((element: any) => {
      assert.hasAnyKeys(element, ["private"]);
    });
  });

  it("Return taxi data on outdated etag", async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate((x) => {
      x.data[0].private = false;
    });

    const dataDumpResponse = await getTaxiDataDump(newOperator.email);
    assert.strictEqual(dataDumpResponse.status, StatusCodes.OK);

    const createResponse = await setupNewTaxi(dtoCreate, newOperator.apikey);
    assert.strictEqual(createResponse.status, StatusCodes.CREATED);

    const dataDumpResponseWithEtag = await getTaxiDataDump(
      newOperator.email,
      null,
      dataDumpResponse.get("etag")
    );
    assert.strictEqual(dataDumpResponseWithEtag.status, StatusCodes.OK);
  });
}

function testTaxiDataDumpsAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to access taxi data dumps `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    const responseDataDump = await getTaxiDataDump(operator.email, apiKey);
    assert.strictEqual(responseDataDump.status, StatusCodes.OK);
  });
}
