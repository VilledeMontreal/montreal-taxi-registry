// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export const selectSample = `SELECT FROM taxiestimate.samples WHERE id = $1::int`;

export const insertSample = `INSERT INTO taxiestimate.samples (
  id,
  name,
  description,
  created_at,
  created_by
) VALUES (
  $1::int,
  $2::text,
  $3::text,
  $4::timestamp without time zone,
  $5::text
) RETURNING *`;

export const updateSample = `UPDATE taxiestimate.samples SET
  name = $2::text,
  description = $3::text,
  created_at = $4::timestamp without time zone,
  created_by = $5::text
WHERE id = $1::int
RETURNING id
`;

export const insertRealTrips = `INSERT INTO taxiestimate.real_trips (
  sample_id,
  departure_time,
  departure_lat,
  departure_lon,
  arrival_time,
  arrival_lat,
  arrival_lon,
  duration_seconds,
  duration_above_speed_threshold_seconds,
  duration_below_speed_threshold_seconds,
  distance_meters,
  distance_above_speed_threshold_meters,
  distance_below_speed_threshold_meters,
  price_cad
  ) SELECT
  real_trips.sample_id,
  real_trips.departure_time,
  real_trips.departure_lat,
  real_trips.departure_lon,
  real_trips.arrival_time,
  real_trips.arrival_lat,
  real_trips.arrival_lon,
  real_trips.duration_seconds,
  real_trips.duration_above_speed_threshold_seconds,
  real_trips.duration_below_speed_threshold_seconds,
  real_trips.distance_meters,
  real_trips.distance_above_speed_threshold_meters,
  real_trips.distance_below_speed_threshold_meters,
  real_trips.price_cad
  FROM json_populate_recordset(null::taxiestimate.real_trips, $1) AS real_trips
`;

export const deleteRealTrips = `DELETE FROM taxiestimate.real_trips
  WHERE sample_id = $1::int
  AND arrival_time >= $2::timestamp without time zone
  AND arrival_time <= $3::timestamp without time zone
`;
