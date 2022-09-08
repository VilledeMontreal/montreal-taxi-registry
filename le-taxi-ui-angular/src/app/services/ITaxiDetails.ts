// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface ITaxiDetails {
  ads_id: number;
  air_con: boolean;
  amex_accepted: boolean;
  baby_seat: boolean;
  ban_begin: any;
  ban_end: any;
  bank_check_accepted: boolean;
  bike_accepted: boolean;
  color: string;
  constructor_id: number;
  cpam_conventionne: boolean;
  credit_card_accepted: boolean;
  date_dernier_ct: string;
  date_validite_ct: string;
  driver_id: number;
  dvd_player: boolean;
  electronic_toll: boolean;
  engine: string;
  every_destination: boolean;
  first_name: string;
  fresh_drink: boolean;
  gps: boolean;
  horodateur: string;
  horse_power: number;
  id: string;
  insee: string;
  last_name: string;
  licence_plate: string;
  luxury: boolean;
  model_id: number;
  model_name: string;
  model_year: number;
  nb_seats: number;
  nfc_cc_accepted: boolean;
  nom_operator: string;
  numero: string;
  owner_name: string;
  pet_accepted: boolean;
  private: boolean;
  professional_licence: string;
  rating: number;
  relais: boolean;
  special_need_vehicle: boolean;
  status: string;
  tablet: boolean;
  taximetre: string;
  type_: string;
  vdm_vignette: string;
  vehicle_id: number;
  wifi: boolean;
}
