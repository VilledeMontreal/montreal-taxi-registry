// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class MapTaxiModel {
  constructor() { }

  idTaxi: string;
  company: string;
  lat: string;
  lon: string;
  statut: string;
  lastUpdate: number;
  device?: string;
  version?: string;
}
