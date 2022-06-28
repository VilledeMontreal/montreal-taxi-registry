// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface IHail {
  latitude: number;
  longitude: number;
  dateLastStatusChange: string;
  dateLastTransmit: string;
  incident: any;
}
