// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { IPathPoint } from 'app/taxi-path-map/IPathPoint';

export function pointsFromGeojsonPath(geojsonPath: any): IPathPoint[] {
  const { features } = geojsonPath;
  const pathPoints = features.slice(0, features.length);
  pathPoints.forEach((feature: any, index: number) => (feature.index = index));
  return pathPoints;
}
