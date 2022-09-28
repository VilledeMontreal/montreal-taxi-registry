// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { BadRequestError } from "../features/errorHandling/errors";
import { latestTaxiPositionRepository } from "../features/latestTaxiPositions/latestTaxiPosition.repository";
import { postgrePool } from '../features/shared/taxiPostgre/taxiPostgre';
import { TaxiStatus } from "../libs/taxiStatus";

export class TaxiService {
  async getTaxis(idTaxi: string) {
    if (!idTaxi) throw new BadRequestError('idTaxi missing');
    const queryResult = await postgrePool.query(
      `SELECT public.taxi.id, public.taxi.private, public.taxi.vehicle_id, public.taxi.ads_id, public.taxi.driver_id, public.taxi.rating, public.taxi.ban_begin, public.taxi.ban_end,
        public."ADS".numero, public."ADS".insee, public."ADS".vdm_vignette, public."ADS".owner_name,
        public.vehicle_description.model_id, public.vehicle_description.constructor_id, public.vehicle_description.model_year, public.vehicle_description.engine, public.vehicle_description.horse_power, public.vehicle_description.relais,
        public.vehicle_description.horodateur, public.vehicle_description.taximetre, public.vehicle_description.date_dernier_ct, public.vehicle_description.date_validite_ct, public.vehicle_description.special_need_vehicle, public.vehicle_description.type_,
        public.vehicle_description.luxury, public.vehicle_description.credit_card_accepted, public.vehicle_description.nfc_cc_accepted, public.vehicle_description.amex_accepted, public.vehicle_description.bank_check_accepted, public.vehicle_description.fresh_drink,
        public.vehicle_description.dvd_player, public.vehicle_description.tablet, public.vehicle_description.wifi, public.vehicle_description.baby_seat, public.vehicle_description.bike_accepted, public.vehicle_description.pet_accepted, public.vehicle_description.air_con,
        public.vehicle_description.electronic_toll, public.vehicle_description.gps, public.vehicle_description.cpam_conventionne, public.vehicle_description.every_destination, public.vehicle_description.color, public.vehicle_description.nb_seats,
        public.driver.first_name, public.driver.last_name, public.driver.professional_licence, public.vehicle.licence_plate , public."user".email as nom_operator, public.model.name as model_name
        FROM public.taxi
            left outer join public."ADS" on public.taxi.ads_id= public."ADS".id
            left outer join public."user" on public.taxi.added_by = public."user".id
            left outer join public.vehicle_description on public.taxi.vehicle_id = public.vehicle_description.vehicle_id
            left outer join public.model on public.vehicle_description.model_id = public.model.id
            left outer join public.vehicle on public.taxi.vehicle_id = public.vehicle.id
            left outer join public.driver on public.taxi.driver_id = public.driver.id
          WHERE public.taxi.id=$1::text`, [idTaxi]);

    if (!queryResult || !queryResult.rows || !queryResult.rows.length)
      throw new BadRequestError('Unable to find requested taxi');

    const taxisActif = await latestTaxiPositionRepository.getLatestTaxiPositions();
    const taxi = taxisActif?.find(actif => actif.taxi.id === queryResult.rows[0].id);

    return [{
      ...queryResult.rows[0],
      status: taxi && taxi.status || TaxiStatus.Off
    }];
  }

  async findTaxis(licencePlate: string, professionalLicence: string) {
    if (!licencePlate && !professionalLicence) throw new BadRequestError('missing parameters');
    if (licencePlate) {
      const queryResult = await postgrePool.query(`
        SELECT taxi.id
        FROM vehicle left join public.taxi on vehicle.id = taxi.vehicle_id
        WHERE licence_plate=$1::text
        `, [licencePlate]);
      return queryResult.rows;
    } else if (professionalLicence) {
      const queryResult = await postgrePool.query(`
        SELECT taxi.id
        FROM driver left join public.taxi on driver.id = taxi.driver_id
        WHERE professional_licence=$1::text
        `, [professionalLicence]);
        return queryResult.rows;
    }
  }
}
