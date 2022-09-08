// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface DetailsTaxi {
  vdm_vignette: string;
  type_: string;
  color: string;
  model_year: string;
  category: string;
  engine: string;
  nb_seats: string;
  taximetre: string;
  owner_name: string;
  ban_begin: string;
  ban_end: string;

  first_name: string;
  last_name: string;
  professional_licence: string;
  insee: string;
  private: string;
  status: string;
  rating: string;

  air_con: boolean;
  amex_accepted: boolean;
  baby_seat: boolean;
  bank_check_accepted: boolean;
  bike_accepted: boolean;
  credit_card_accepted: boolean;
  dvd_player: boolean;
  electronic_toll: boolean;
  every_destination: boolean;
  fresh_drink: boolean;
  gps: boolean;
  luxury: boolean;
  nfc_cc_accepted: boolean;
  pet_accepted: boolean;
  relais: boolean;
  special_need_vehicle: boolean;
  tablet: boolean;
  wifi: boolean;
  doublage: boolean;
}
