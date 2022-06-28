// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { taxiEstimatePostgrePool } from '../../../../features/shared/taxiEstimate/taxiEstimatePostgre';

export async function createTablePolyRealTripsScript(): Promise<void> {
  await taxiEstimatePostgrePool.query(`
  CREATE TABLE "taxiestimate"."poly_real_trips" (
    "id" serial NOT NULL,
    "departure_time" timestamp without time zone NOT NULL,
    "departure_lat" float8 NOT NULL,
    "departure_lon" float8 NOT NULL,
    "arrival_time" timestamp without time zone NOT NULL,
    "arrival_lat" float8 NOT NULL,
    "arrival_lon" float8 NOT NULL,
    "duration_min" int4 NOT NULL,
    "duration_above_speed_threshold_min" int4 NULL,
    "duration_below_speed_threshold_min" int4 NULL,
    "distance_km" int4 NOT NULL,
    "distance_above_speed_threshold_km" int4 NULL,
    "distance_below_speed_threshold_km" int4 NULL,
    "price_cad" numeric(6,2) null );
`);
}
