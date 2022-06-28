// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class VehicleResponseModel {
  constructor(
    licence_plate?: string,
    model_year?: number,
    engine?: string,
    horse_power?: number,
    relais?: boolean,
    horodateur?: string,
    taximetre?: string,
    date_dernier_ct?: string,
    date_validite_ct?: string,
    special_need_vehicle?: boolean,
    type_?: string,
    luxury?: boolean,
    credit_card_accepted?: boolean,
    nfc_cc_accepted?: boolean,
    amex_accepted?: boolean,
    bank_check_accepted?: boolean,
    fresh_drink?: boolean,
    dvd_player?: boolean,
    tablet?: boolean,
    wifi?: boolean,
    baby_seat?: boolean,
    bike_accepted?: boolean,
    pet_accepted?: boolean,
    air_con?: boolean,
    electronic_toll?: boolean,
    gps?: boolean,
    cpam_conventionne?: boolean,
    every_destination?: boolean,
    color?: string,
    nb_seats?: number,
    model?: string,
    Xconstructor?: string
  ) {
    this.licence_plate = licence_plate;
    this.model_year = model_year;
    this.engine = engine;
    this.horse_power = horse_power;
    this.relais = relais;
    this.horodateur = horodateur;
    this.taximetre = taximetre;
    this.date_dernier_ct = date_dernier_ct;
    this.date_validite_ct = date_validite_ct;
    this.special_need_vehicle = special_need_vehicle;
    this.type_ = type_;
    this.luxury = luxury;
    this.credit_card_accepted = credit_card_accepted;
    this.nfc_cc_accepted = nfc_cc_accepted;
    this.amex_accepted = amex_accepted;
    this.bank_check_accepted = bank_check_accepted;
    this.fresh_drink = fresh_drink;
    this.dvd_player = dvd_player;
    this.tablet = tablet;
    this.wifi = wifi;
    this.baby_seat = baby_seat;
    this.bike_accepted = bike_accepted;
    this.pet_accepted = pet_accepted;
    this.air_con = air_con;
    this.electronic_toll = electronic_toll;
    this.gps = gps;
    this.cpam_conventionne = cpam_conventionne;
    this.every_destination = every_destination;
    this.color = color;
    this.nb_seats = nb_seats;
    this.model = model;
    this.Xconstructor = Xconstructor;
  }

  id: number;
  licence_plate: string;
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
  nb_seats: number;
  model: string;
  Xconstructor: string;
}
