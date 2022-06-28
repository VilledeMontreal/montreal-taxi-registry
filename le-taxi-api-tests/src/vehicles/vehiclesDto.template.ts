// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { defineCopyTemplate } from '../shared/copyTemplate/copyTemplate';
import { IVehicle } from './../shared/taxiRegistryDtos/taxiRegistryDtos';

export const copyVehicleTemplate = defineCopyTemplate<IVehicle>({
  data: [
    {
      air_con: false,
      horodateur: 'defaultHorodateur',
      color: 'defaultColor',
      date_dernier_ct: '2019-01-01',
      date_validite_ct: '2999-01-01',
      credit_card_accepted: false,
      electronic_toll: false,
      fresh_drink: false,
      pet_accepted: false,
      tablet: false,
      dvd_player: false,
      taximetre: 'defaultTaximetre',
      every_destination: false,
      nfc_cc_accepted: false,
      baby_seat: false,
      special_need_vehicle: false,
      amex_accepted: false,
      gps: false,
      engine: 'defaultEngine',
      cpam_conventionne: false,
      relais: false,
      bank_check_accepted: false,
      luxury: false,
      licence_plate: 'auto',
      horse_power: 1.1,
      model_year: 2010,
      wifi: false,
      type_: 'sedan',
      nb_seats: 1,
      constructor: 'defaultConstructor',
      bike_accepted: false,
      model: 'defaultModel',
      vehicle_identification_number: 'defaultNIV'
    }
  ]
});
