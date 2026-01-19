// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { shouldThrow } from "@villedemontreal/concurrent-api-tests";
import { assert } from "chai";
import { StatusCodes } from "http-status-codes";
import { getTaxiData, getTaxiSearch } from "./map.apiClient";

export async function invalidMapTests(): Promise<void> {
  it("Should throw a 400 error when no idTaxi passed to taxi-data from map controller", async () => {
    await shouldThrow(
      () => getTaxiData(),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, "idTaxi missing");
      },
    );
  });

  it("Should throw a 400 error when no parameters passed to taxi-search from map controller", async () => {
    await shouldThrow(
      () => getTaxiSearch(),
      (err) => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          "missing parameters",
        );
      },
    );
  });
}
