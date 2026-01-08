// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
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
export async function invalidTaxiDataDumpsTests(): Promise<void> {
  testTaxiDataDumpsAccessInvalid(UserRole.Operator);
  testTaxiDataDumpsAccessInvalid(UserRole.Inspector);
  testTaxiDataDumpsAccessInvalid(UserRole.Motor);
  testTaxiDataDumpsAccessInvalid(UserRole.Prefecture);

  it("Returns error no new data on taxi data dump", async () => {
    const newOperator = await createNonImmutableUser(UserRole.Operator);
    const dtoCreate = copyTaxiTemplate((x) => {
      x.data[0].private = false;
    });
    const createResponse = await setupNewTaxi(dtoCreate, newOperator.apikey);
    assert.strictEqual(createResponse.status, StatusCodes.CREATED);

    const dataDumpResponse = await getTaxiDataDump(newOperator.email);
    assert.strictEqual(dataDumpResponse.status, StatusCodes.OK);

    await shouldThrow(
      () =>
        getTaxiDataDump(newOperator.email, null, dataDumpResponse.get("etag")),
      (err) => assert.strictEqual(err.status, StatusCodes.NOT_MODIFIED)
    );
  });
}

function testTaxiDataDumpsAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to access taxi data dumps `, async () => {
    const operator = await getImmutableUser(UserRole.Operator);
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => getTaxiDataDump(operator.email, apiKey),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          "The user has a role which has insufficient permissions to access this resource."
        );
      }
    );
  });
}
