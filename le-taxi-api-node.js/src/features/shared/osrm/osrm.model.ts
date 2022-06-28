// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface IOsrmLegs {
  steps?: any[];
  distance: number;
  duration: number;
  summary: string;
  weight: number;
}

export class OsrmRoute {
  legs: IOsrmLegs[];
  distance: number = 0;
  duration: number = 0;
  weight_name: string;
  weight: number;

  /* tslint:disable:no-empty */
  constructor() {}
}
