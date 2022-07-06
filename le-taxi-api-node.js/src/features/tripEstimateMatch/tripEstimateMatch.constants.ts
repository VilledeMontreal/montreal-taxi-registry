// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export const clearMatches = `DELETE FROM taxiestimate.matches WHERE sample_id = $1::int`;

export const findMatches = `
SELECT
  trips.id,
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
FROM public.trips
WHERE
  departure_time >= $1 AND
  departure_time <= $2 AND
  departure_lat >= $3 AND
  departure_lat <= $4 AND
  departure_lon >= $5 AND
  departure_lon <= $6 AND
  arrival_lat >= $7 AND
  arrival_lat <= $8 AND
  arrival_lon >= $9 AND
  arrival_lon <= $10
`;

export const insertMatches = `INSERT INTO taxiestimate.matches (
  sample_id,
  real_trip_id,
  taxi_trip_id
  ) SELECT
  matches.sample_id,
  matches.real_trip_id,
  matches.taxi_trip_id
  FROM json_populate_recordset(null::taxiestimate.matches, $1) AS matches
`;
