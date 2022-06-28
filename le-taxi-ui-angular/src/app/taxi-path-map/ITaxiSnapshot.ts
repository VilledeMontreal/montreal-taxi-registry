// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface ITaxiSnapshot {
  latitude: number;
  longitude: number;
  status: string;
  timestampUTC: string;
  azimuth: number;
  speed: number;
}
