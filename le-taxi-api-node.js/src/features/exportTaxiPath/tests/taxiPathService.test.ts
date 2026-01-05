// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from "chai";
import { TaxiPathService } from "../taxiPath.service";
import {
  expectedGeoJsonPayload,
  geoPositionsSample,
  taxiInfoSample,
  taxiSnapshotSample,
} from "./testData";

describe("TaxiPathService TESTS", () => {
  const taxiPathService = new TaxiPathService();
  describe("convertDataToGeoJson", () => {
    it("should return data in geojson format", () => {
      const geoLineString = Object.assign(geoPositionsSample, taxiInfoSample);
      const geoJson = taxiPathService.generateGeoJson(
        geoLineString,
        taxiSnapshotSample
      );
      assert.deepEqual(geoJson, expectedGeoJsonPayload);
    });
  });

  describe("getPositionFromData", () => {
    it("should return positions from taxi position snapshots", () => {
      const positions =
        taxiPathService.getPositionsFromSnapshots(taxiSnapshotSample);
      assert.deepEqual(positions, geoPositionsSample.line);
    });

    it("should return empty array if there are no taxi position snapshots", () => {
      const positions = taxiPathService.getPositionsFromSnapshots([]);
      assert.lengthOf(positions, 0);
    });
  });
});
