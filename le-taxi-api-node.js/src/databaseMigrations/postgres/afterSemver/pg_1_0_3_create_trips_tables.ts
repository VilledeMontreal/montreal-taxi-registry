// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { postgrePool } from "../../../features/shared/taxiPostgre/taxiPostgre";

export async function pg_1_0_3_create_trips_tables(): Promise<void> {
  await postgrePool.query(`
CREATE TABLE public.trips (
  id serial NOT NULL,
  departure_time timestamp without time zone NOT NULL,
  arrival_time timestamp without time zone NOT NULL,
  departure_lat float8 NOT NULL,
  departure_lon float8 NOT NULL,
  arrival_lat float8 NOT NULL,
  arrival_lon float8 NOT NULL,
  total_duration_seconds int4 NOT NULL,
  idle_duration_seconds int4 NOT NULL,
  distance_meters int4 NOT NULL,
  coordinates geometry NOT NULL,
  taxi_path geometry NOT NULL,
  confidence varchar(256) NOT NULL,
  confidence_reason varchar(256) NULL,
  CONSTRAINT "trips_pkey" PRIMARY KEY (id)
);

CREATE TABLE public.trip_synchronization (
    batch_date timestamp without time zone NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE UNIQUE INDEX trip_synchronization_ensure_no_more_than_1_rows
    ON public.trip_synchronization((batch_date IS NOT NULL));

INSERT INTO public.trip_synchronization VALUES ('2021-01-01 00:00:00');
`);
}
