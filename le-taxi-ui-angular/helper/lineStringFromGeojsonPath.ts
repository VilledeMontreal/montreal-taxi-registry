// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function linesStringFromGeojsonPath(geojsonPath: any): any {
  const { features } = geojsonPath;
  return features.pop();
}
