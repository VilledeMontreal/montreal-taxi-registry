// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export const readBatchDate = `SELECT batch_date FROM public.trip_synchronization`;

export const updateBatchDate = `UPDATE public.trip_synchronization
  SET batch_date = $1::timestamp without time zone
`;

export const insertTrips = `INSERT INTO public.trips (
  departure_time,
  arrival_time,
  departure_lat,
  departure_lon,
  arrival_lat,
  arrival_lon,
  total_duration_seconds,
  idle_duration_seconds,
  distance_meters,
  coordinates,
  taxi_path,
  confidence,
  confidence_reason
  ) SELECT
  trips.departure_time,
  trips.arrival_time,
  trips.departure_lat,
  trips.departure_lon,
  trips.arrival_lat,
  trips.arrival_lon,
  trips.total_duration_seconds,
  trips.idle_duration_seconds,
  trips.distance_meters,
  trips.coordinates,
  trips.taxi_path,
  trips.confidence,
  trips.confidence_reason
  FROM json_populate_recordset(null::public.trips, $1) AS trips
`;

export const deleteTrips = `DELETE FROM public.trips
  WHERE arrival_time >= $1::timestamp without time zone
  AND arrival_time <= $2::timestamp without time zone
`;
