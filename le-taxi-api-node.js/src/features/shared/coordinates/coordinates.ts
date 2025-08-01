// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface ICoordinates {
  lat: number;
  lon: number;
}

export interface ICoordinatesWithAddress extends ICoordinates {
  address: string;
}
