// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional
} from 'class-validator';

export class VehicleModel {
  @IsOptional()
  @IsInt()
  id: number;

  @IsDefined()
  @IsNotEmpty()
  licence_plate: string;

  added_at: Date;
  added_via: string;
  source: string;
  last_update_at: Date;

  model_id: number;
  constructor_id: number;
  model_year: number;
  engine: string;
  horse_power: number;
  relais: boolean;
  horodateur: string;
  taximetre: string;
  date_dernier_ct: string;
  date_validite_ct: string;
  special_need_vehicle: boolean;
  type_: string;
  luxury: boolean;
  credit_card_accepted: boolean;
  nfc_cc_accepted: boolean;
  amex_accepted: boolean;
  bank_check_accepted: boolean;
  fresh_drink: boolean;
  dvd_player: boolean;
  tablet: boolean;
  wifi: boolean;
  baby_seat: boolean;
  bike_accepted: boolean;
  pet_accepted: boolean;
  air_con: boolean;
  electronic_toll: boolean;
  gps: boolean;
  cpam_conventionne: boolean;
  every_destination: boolean;
  color: string;
  vehicle_id: number;
  added_by: number;
  status: string;
  nb_seats: number;
  model: string;
  Xconstructor: string;

  //grid Fields
  modelName: string;
  constructorName: string;
  added_By_name: string;
}
