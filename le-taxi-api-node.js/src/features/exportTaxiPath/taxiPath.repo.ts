// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { BadRequestError } from "../errorHandling/errors";
import { getMongoDb } from "../shared/taxiMongo/taxiMongo";
import { postgrePool } from "../shared/taxiPostgre/taxiPostgre";

export class TaxiPathRepository {
  public async getTaxiPositionSnapshots(
    taxiId: string,
    utcDateMin: Date,
    utcDateMax: Date
  ): Promise<any[]> {
    const mongoDb = getMongoDb();
    const taxiPositionSnapshots = mongoDb
      .collection("taxiPositionSnapshots")
      .aggregate([
        {
          $match: {
            receivedAt: {
              $gte: new Date(utcDateMin.toISOString()),
              $lte: new Date(utcDateMax.toISOString()),
            },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.taxi": taxiId } },
        { $sort: { "items.timestampUTC": 1 } },
        {
          $project: {
            _id: 0,
            lat: "$items.lat",
            lon: "$items.lon",
            timestampUTC: "$items.timestampUTC",
            status: "$items.status",
            azimuth: "$items.azimuth",
            speed: "$items.speed",
          },
        },
      ])
      .toArray();

    return taxiPositionSnapshots;
  }

  public async getTaxiInfo(taxiId: string): Promise<any> {
    if (!taxiId) throw new BadRequestError("taxiId missing");
    const queryResult = await postgrePool.query(
      `SELECT public.taxi.id, public.taxi.vehicle_id, public.taxi.ads_id, public.taxi.driver_id, public.taxi.rating, public.taxi.ban_begin, public.taxi.ban_end,
          public."ADS".numero, public."ADS".insee, public."ADS".vdm_vignette, public."ADS".owner_name,
          public.vehicle_description.model_id, public.vehicle_description.constructor_id, public.vehicle_description.model_year, public.vehicle_description.engine, public.vehicle_description.horse_power, public.vehicle_description.relais,
          public.vehicle_description.horodateur, public.vehicle_description.taximetre, public.vehicle_description.date_dernier_ct, public.vehicle_description.date_validite_ct, public.vehicle_description.special_need_vehicle, public.vehicle_description.type_,
          public.vehicle_description.luxury, public.vehicle_description.credit_card_accepted, public.vehicle_description.nfc_cc_accepted, public.vehicle_description.amex_accepted, public.vehicle_description.bank_check_accepted, public.vehicle_description.fresh_drink,
          public.vehicle_description.dvd_player, public.vehicle_description.tablet, public.vehicle_description.wifi, public.vehicle_description.baby_seat, public.vehicle_description.bike_accepted, public.vehicle_description.pet_accepted, public.vehicle_description.air_con, public.vehicle_description.bonjour,
          public.vehicle_description.electronic_toll, public.vehicle_description.gps, public.vehicle_description.cpam_conventionne, public.vehicle_description.every_destination, public.vehicle_description.color, public.vehicle_description.nb_seats,
          public.driver.first_name, public.driver.last_name, public.driver.professional_licence, public.vehicle.licence_plate , public."user".email as nom_operator, public.model.name as model_name
        FROM public.taxi
              left outer join public."ADS" on public.taxi.ads_id= public."ADS".id
              left outer join public."user" on public.taxi.added_by = public."user".id
              left outer join public.vehicle_description on public.taxi.vehicle_id = public.vehicle_description.vehicle_id
              left outer join public.model on public.vehicle_description.model_id = public.model.id
              left outer join public.vehicle on public.taxi.vehicle_id = public.vehicle.id
              left outer join public.driver on public.taxi.driver_id = public.driver.id
        WHERE public.taxi.id = $1::text`,
      [taxiId]
    );

    if (!queryResult || !queryResult.rows || !queryResult.rows[0])
      throw new BadRequestError("Unable to find taxi");
    return queryResult.rows[0];
  }
}
