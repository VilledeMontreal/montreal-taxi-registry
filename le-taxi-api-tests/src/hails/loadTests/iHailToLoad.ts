// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface IHailToLoad {
  operator: {
    apiKey: string;
    email: string;
  };
  motor: {
    apiKey: string;
  };
  taxis: {
    id: string;
  }[];
}
