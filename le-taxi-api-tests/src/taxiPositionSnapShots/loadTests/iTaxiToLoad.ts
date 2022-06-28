// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface ITaxiToLoad {
  items: {
    operator: {
      apikey: string;
      email: string;
    };
    taxi: {
      id: string;
    }[];
  }[];
}
