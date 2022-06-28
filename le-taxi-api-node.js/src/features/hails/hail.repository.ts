// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { QueryResult } from 'pg';
import { ConflictRequestError } from '../errorHandling/errors';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { HailModel } from './hail.model';
import { mapQueryResultToHailModel } from './hail.queryResultsMapper';

class HailRepository {
  public async saveHail(hailModel: HailModel, updatedAt: string): Promise<void> {
    if (!updatedAt) {
      await this.createHail(hailModel);
    } else {
      await this.updateHail(hailModel, updatedAt);
    }
  }

  private async createHail(hailModel: HailModel): Promise<void> {
    const query = `
    INSERT INTO public.hail(id,
                             status,
                             creation_datetime,
                             taxi_id,
                             operateur_id,
                             customer_address,
                             customer_phone_number,
                             added_by,
                             taxi_phone_number,
                             reporting_customer,
                             reporting_customer_reason,
                             incident_customer_reason,
                             incident_taxi_reason,
                             rating_ride_reason,
                             rating_ride,
                             customer_lat,
                             customer_lon,
                             last_status_change,
                             last_update_at,
                             read_only_after)
    VALUES ($1::text, $2::hail_status, $3::timestamp without time zone, $4::text,
            $5::int, $6::text,$7::text, $8::int, $9::text,$10::boolean, $11::reporting_customer_reason_enum,
            $12::incident_customer_reason_enum, $13::incident_taxi_reason_enum, $14::rating_ride_reason_enum,
            $15::int,  $16::double precision, $17::double precision, $18::timestamp without time zone,
            $19::timestamp without time zone, $20::timestamp without time zone)`;
    await postgrePool.query(query, [
      hailModel.id,
      hailModel.last_persisted_status,
      hailModel.creation_datetime,
      hailModel.taxi_id,
      hailModel.operateur_id,
      hailModel.customer_address,
      hailModel.customer_phone_number,
      hailModel.added_by,
      hailModel.taxi_phone_number,
      hailModel.reporting_customer,
      hailModel.reporting_customer_reason,
      hailModel.incident_customer_reason,
      hailModel.incident_taxi_reason,
      hailModel.rating_ride_reason,
      hailModel.rating_ride,
      hailModel.customer_lat,
      hailModel.customer_lon,
      hailModel.last_persisted_status_change,
      hailModel.last_update_at,
      hailModel.read_only_after
    ]);
  }

  private async updateHail(hailModel: HailModel, updatedAt: string): Promise<void> {
    const query: string = `
    UPDATE public.hail
    SET  status = $1::hail_status,
         creation_datetime = $2::timestamp without time zone,
         taxi_id = $3::text,
         operateur_id = $4::int,
         customer_address = $5::text,
         customer_phone_number = $6::text,
         customer_lat = $7::double precision,
         customer_lon = $8::double precision,
         added_by = $9::int,
         taxi_phone_number = $10::text,
         reporting_customer = $11::boolean,
         reporting_customer_reason = $12::reporting_customer_reason_enum,
         incident_customer_reason = $13::incident_customer_reason_enum,
         incident_taxi_reason = $14::incident_taxi_reason_enum,
         rating_ride_reason = $15::rating_ride_reason_enum,
         rating_ride = $16::int,
         last_status_change = $17::timestamp without time zone,
         change_to_accepted_by_customer = $18::timestamp without time zone,
         change_to_accepted_by_taxi = $19::timestamp without time zone,
         change_to_declined_by_customer = $20::timestamp without time zone,
         change_to_declined_by_taxi = $21::timestamp without time zone,
         change_to_failure = $22::timestamp without time zone,
         change_to_incident_customer = $23::timestamp without time zone,
         change_to_incident_taxi = $24::timestamp without time zone,
         change_to_received_by_operator = $25::timestamp without time zone,
         change_to_received_by_taxi = $26::timestamp without time zone,
         change_to_sent_to_operator = $27::timestamp without time zone,
         change_to_customer_on_board = $28::timestamp without time zone,
         change_to_finished = $29::timestamp without time zone,
         last_update_at = $30::timestamp without time zone,
         read_only_after = $33::timestamp without time zone
    WHERE public.hail.id = $31::text
    AND public.hail.last_update_at = $32::timestamp without time zone`;
    const hailUpdated = await postgrePool.query(query, [
      hailModel.last_persisted_status,
      hailModel.creation_datetime,
      hailModel.taxi_id,
      hailModel.operateur_id,
      hailModel.customer_address,
      hailModel.customer_phone_number,
      hailModel.customer_lat,
      hailModel.customer_lon,
      hailModel.added_by,
      hailModel.taxi_phone_number,
      hailModel.reporting_customer,
      hailModel.reporting_customer_reason,
      hailModel.incident_customer_reason,
      hailModel.incident_taxi_reason,
      hailModel.rating_ride_reason,
      hailModel.rating_ride,
      hailModel.last_persisted_status_change,
      hailModel.change_to_accepted_by_customer,
      hailModel.change_to_accepted_by_taxi,
      hailModel.change_to_declined_by_customer,
      hailModel.change_to_declined_by_taxi,
      hailModel.change_to_failure,
      hailModel.change_to_incident_customer,
      hailModel.change_to_incident_taxi,
      hailModel.change_to_received_by_operator,
      hailModel.change_to_received_by_taxi,
      hailModel.change_to_sent_to_operator,
      hailModel.change_to_customer_on_board,
      hailModel.change_to_finished,
      hailModel.last_update_at,
      hailModel.id,
      updatedAt,
      hailModel.read_only_after
    ]);

    if (hailUpdated.rowCount === 0) {
      throw new ConflictRequestError(
        `The request could not be completed due to a conflict with the current state of the target resource`
      );
    }
  }

  public async getHailById(id: string): Promise<HailModel> {
    const query = `
    SELECT
          id,
          added_by,
          taxi_id,
          operateur_id,
          customer_address,
          customer_phone_number,
          customer_lat,
          customer_lon,
          rating_ride,
          rating_ride_reason,
          incident_customer_reason,
          taxi_phone_number,
          incident_taxi_reason,
          reporting_customer,
          reporting_customer_reason,
          status as last_persisted_status,
          last_status_change as last_persisted_status_change,
          change_to_accepted_by_customer,
          change_to_accepted_by_taxi,
          change_to_declined_by_customer,
          change_to_declined_by_taxi,
          change_to_failure,
          change_to_incident_customer,
          change_to_incident_taxi,
          change_to_received_by_operator,
          change_to_received_by_taxi,
          change_to_sent_to_operator,
          change_to_customer_on_board,
          change_to_finished,
          read_only_after,
          creation_datetime,
          last_update_at
    FROM public.hail
    WHERE public.hail.id = $1::text`;
    const queryResult: QueryResult = await postgrePool.query(query, [id]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }

    const hailResponse = mapQueryResultToHailModel(queryResult.rows[0]);
    const hailModel: HailModel = Object.assign(new HailModel(), hailResponse);
    return hailModel;
  }

  public async getTaxiAverageRating(taxiId: string): Promise<any> {
    const query = `
    with last_500_ratings as (
      SELECT rating_ride
      FROM public.hail
      WHERE
        taxi_id = $1::text and
        status ='finished' and
        rating_ride is not null
      ORDER BY last_update_at desc limit 500
  )
  SELECT round(sum(cast(rating_ride as decimal))/count(*), 1) as average_rating
  FROM last_500_ratings`;

    const queryResult: QueryResult = await postgrePool.query(query, [taxiId]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0] || !queryResult.rows[0].average_rating) {
      return null;
    }
    return queryResult.rows[0].average_rating;
  }

  public async getHailByTaxiId(taxiId: string): Promise<any> {
    const query = `
    SELECT id
    FROM public.hail
    WHERE taxi_id = $1::text
    ORDER BY creation_datetime desc
    LIMIT 1`;

    const queryResult: QueryResult = await postgrePool.query(query, [taxiId]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }

    return this.getHailById(queryResult.rows[0].id);
  }
}

export const hailRepository = new HailRepository();
