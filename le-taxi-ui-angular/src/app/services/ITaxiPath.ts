// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface ITaxiPath {
  type: string;
  features: IPathPoint[];
}

interface IPathPoint {
  type: string;
  geometry: any;
  properties: any;
}
