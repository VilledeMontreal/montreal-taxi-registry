// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface IOrderHail {
  customer_address: string;
  customer_id: string;
  customer_lat: number;
  customer_lon: number;
  customer_phone_number: string;
  operateur: string;
  taxi_id: string;
}
