// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { taxiEstimatePostgrePool } from "../../../../features/shared/taxiEstimate/taxiEstimatePostgre";

const MIN_TO_SEC = 60;
const KM_TO_METER = 1000;

export async function convertPolyRealTripsToRealTripsScript(): Promise<void> {
  const sampleId = 4;

  await taxiEstimatePostgrePool.query(`
  insert into samples(
  id,
  name,
  description,
  created_at,
  created_by)
  values(
  ${sampleId},
  'registre_courses_prix_20190901_20211231.csv',
  'Échantillon poly course de taxi septembre 2019',
  '${new Date().toISOString()}',
  'ublai7c');`);

  await taxiEstimatePostgrePool.query(`
  insert into "taxiestimate"."real_trips" (
    "sample_id",
    "departure_time",
    "departure_lat",
    "departure_lon",
    "arrival_time",
    "arrival_lat",
    "arrival_lon",
    "duration_seconds",
    "duration_above_speed_threshold_seconds",
    "duration_below_speed_threshold_seconds",
    "distance_meters",
    "distance_above_speed_threshold_meters",
    "distance_below_speed_threshold_meters",
    "price_cad")
    select
    ${sampleId},
    departure_time,
    departure_lat,
    departure_lon,
    arrival_time,
    arrival_lat,
    arrival_lon,
    duration_min * ${MIN_TO_SEC},
    duration_above_speed_threshold_min * ${MIN_TO_SEC},
    duration_below_speed_threshold_min * ${MIN_TO_SEC},
    distance_km * ${KM_TO_METER},
    distance_above_speed_threshold_km * ${KM_TO_METER},
    distance_below_speed_threshold_km * ${KM_TO_METER},
    price_cad
    from taxiestimate.poly_real_trips`);
}
