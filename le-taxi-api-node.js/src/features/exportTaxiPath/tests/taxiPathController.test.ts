// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { TaxiPathController } from "../taxiPath.controller";

describe("TaxiPathController TESTS", () => {
  context("validateQuery", () => {
    it("should throw an error if missing parameters", () => {
      assert.throws(() => {
        TaxiPathController.validateDateQuery(undefined, undefined);
      }, "Missing parameters");
    });

    it("should throw an error if missing fromDate parameter", () => {
      assert.throws(() => {
        TaxiPathController.validateDateQuery(
          undefined,
          "2019-04-19T12:20:00.000Z"
        );
      }, "missing: fromDate");
    });

    it("should throw an error if missing toDate parameter", () => {
      assert.throws(() => {
        TaxiPathController.validateDateQuery(
          "2019-04-19T12:20:00.000Z",
          undefined
        );
      }, "missing: toDate");
    });

    it("should throw an error if invalid date format", () => {
      assert.throws(() => {
        TaxiPathController.validateDateQuery(
          "2019-05-05",
          "2019-04-19T12:20:00.000Z"
        );
      }, "Invalid date format");
    });

    it("should throw an error if toDate is before fromDate", () => {
      assert.throws(() => {
        TaxiPathController.validateDateQuery(
          "2019-04-19T14:20:00.000Z",
          "2019-04-19T12:20:00.000Z"
        );
      }, "Invalid dates");
    });

    it("should throw an error if difference between dates is more than 8 hours", () => {
      assert.throws(() => {
        TaxiPathController.validateDateQuery(
          "2019-04-19T12:20:00.000Z",
          "2019-04-19T22:20:00.000Z"
        );
      }, "Difference between dates");
    });

    it("should not throw an error if dates are valid", () => {
      assert.doesNotThrow(() => {
        TaxiPathController.validateDateQuery(
          "2019-04-19T12:00:00.000Z",
          "2019-04-19T20:00:00.000Z"
        );
      }, "Should not throw if difference between dates is 8 hours");
    });
  });
});
