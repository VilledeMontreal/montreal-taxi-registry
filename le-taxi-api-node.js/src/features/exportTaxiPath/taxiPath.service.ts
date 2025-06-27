// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as GeoJSON from "geojson";

export class TaxiPathService {
  public getPositionsFromSnapshots(snapshots: any[]) {
    const geoPositions = [];
    for (const snapshot of snapshots) {
      geoPositions.push([parseFloat(snapshot.lon), parseFloat(snapshot.lat)]);
    }
    return geoPositions;
  }

  public generateGeoJson(geoLineString: any, snapshots: any[]) {
    const geoJsonData = [...snapshots, geoLineString];

    return GeoJSON.parse(geoJsonData, {
      Point: ["lat", "lon"],
      LineString: "line",
    });
  }
}
