// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export const countDistinctRealTripIdByTestExecutionId = `SELECT count(distinct real_trip_id) FROM taxiestimate.estimated_trips WHERE test_execution_id = $1::int`;

export const countRealTrips = `SELECT count(*) FROM taxiestimate.real_trips rt where sample_id = $1::int`;

export const selectTestExecutionReport = [
  {
    name: 'all_trip_duration_absolute_error_percent_avg',
    query: `SELECT round(avg(trip_duration_absolute_error_percent)::numeric, 2) AS all_trip_duration_absolute_error_percent_avg
    FROM taxiestimate.estimated_trips WHERE test_execution_id = $1::int`
  },
  {
    name: 'all_trip_duration_absolute_error_percent_max',
    query: `SELECT round(max(trip_duration_absolute_error_percent)::numeric, 2) AS all_trip_duration_absolute_error_percent_max
    FROM taxiestimate.estimated_trips WHERE test_execution_id = $1::int`
  },
  {
    name: 'all_trip_duration_absolute_error_percent_stddev',
    query: `SELECT round(stddev(trip_duration_absolute_error_percent)::numeric, 2) AS all_trip_duration_absolute_error_percent_stddev
    FROM taxiestimate.estimated_trips WHERE test_execution_id = $1::int`
  },
  {
    name: 'all_trip_duration_absolute_error_percent_p50',
    query: `SELECT percentile_cont(0.5) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS all_trip_duration_absolute_error_percent_p50
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int`
  },
  {
    name: 'all_trip_duration_absolute_error_percent_p90',
    query: `SELECT percentile_cont(0.9) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS all_trip_duration_absolute_error_percent_p90
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int`
  },
  {
    name: 'all_trip_duration_absolute_error_percent_p95',
    query: `SELECT percentile_cont(0.95) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS all_trip_duration_absolute_error_percent_p95
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int`
  },
  {
    name: 'all_trip_duration_absolute_error_percent_p99',
    query: `SELECT percentile_cont(0.99) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS all_trip_duration_absolute_error_percent_p99
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int`
  },
  {
    name: `longer_than_real_trip_duration_absolute_error_percent_p50`,
    query: `SELECT percentile_cont(0.5) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS longer_than_real_trip_duration_absolute_error_percent_p50
        FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `longer_than_real_trip_duration_absolute_error_percent_p90`,
    query: `SELECT percentile_cont(0.9) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS longer_than_real_trip_duration_absolute_error_percent_p90
        FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `longer_than_real_trip_duration_absolute_error_percent_p95`,
    query: `SELECT percentile_cont(0.95) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS longer_than_real_trip_duration_absolute_error_percent_p95
        FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `longer_than_real_trip_duration_absolute_error_percent_p99`,
    query: `SELECT percentile_cont(0.99) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2) AS longer_than_real_trip_duration_absolute_error_percent_p99
        FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `longer_than_real_trip_duration_absolute_error_percent_max`,
    query: `SELECT max(et.trip_duration_absolute_error_percent)::decimal(10,2) AS longer_than_real_trip_duration_absolute_error_percent_max
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `longer_than_real_trip_duration_absolute_error_percent_avg`,
    query: `SELECT round(avg(et.trip_duration_absolute_error_percent)::numeric, 2) AS longer_than_real_trip_duration_absolute_error_percent_avg
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `longer_than_real_trip_duration_absolute_error_percent_stddev`,
    query: `SELECT round(stddev(et.trip_duration_absolute_error_percent)::numeric, 2) AS longer_than_real_trip_duration_absolute_error_percent_stddev
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `longer_than_real_trip_count`,
    query: `SELECT count(et.trip_duration_absolute_error_percent) AS longer_than_real_trip_count
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = true`
  },
  {
    name: `shorter_than_real_trip_duration_absolute_error_percent_p50`,
    query: `SELECT percentile_cont(0.5) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2)
    AS shorter_than_real_trip_duration_absolute_error_percent_p50
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  },
  {
    name: `shorter_than_real_trip_duration_absolute_error_percent_p90`,
    query: `SELECT percentile_cont(0.90) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2)
    AS shorter_than_real_trip_duration_absolute_error_percent_p90
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  },
  {
    name: `shorter_than_real_trip_duration_absolute_error_percent_p95`,
    query: `SELECT percentile_cont(0.95) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2)
    AS shorter_than_real_trip_duration_absolute_error_percent_p95
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  },
  {
    name: `shorter_than_real_trip_duration_absolute_error_percent_p99`,
    query: `SELECT percentile_cont(0.99) within group (order by et.trip_duration_absolute_error_percent)::decimal(10,2)
    AS shorter_than_real_trip_duration_absolute_error_percent_p99
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  },
  {
    name: `shorter_than_real_trip_duration_absolute_error_percent_max`,
    query: `SELECT max(et.trip_duration_absolute_error_percent)
    AS shorter_than_real_trip_duration_absolute_error_percent_max
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  },
  {
    name: `shorter_than_real_trip_duration_absolute_error_percent_avg`,
    query: `SELECT round(avg(et.trip_duration_absolute_error_percent)::numeric, 2)
    AS shorter_than_real_trip_duration_absolute_error_percent_avg
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  },
  {
    name: `shorter_than_real_trip_duration_absolute_error_percent_stddev`,
    query: `SELECT round(stddev(et.trip_duration_absolute_error_percent)::numeric, 2)
    AS shorter_than_real_trip_duration_absolute_error_percent_stddev
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  },
  {
    name: `shorter_than_real_trip_count`,
    query: `SELECT count(et.trip_duration_absolute_error_percent)
    AS shorter_than_real_trip_count
    FROM taxiestimate.estimated_trips et WHERE test_execution_id = $1::int and et.is_longer_than_real_trip = false`
  }
];

export const insertTestExecution = `
INSERT INTO taxiestimate.test_executions (
  sample_id,
  estimated_with,
  created_at,
  created_by
) VALUES (
  $1::int,
  $2::text,
  $3::timestamp without time zone,
  $4::text
) RETURNING id`;

export const insertEstimatedTrips = `
INSERT INTO taxiestimate.estimated_trips (
  real_trip_id,
  test_execution_id,
  estimated_arrival_time,
  estimated_trip_duration_seconds,
  trip_duration_absolute_error_percent,
  is_longer_than_real_trip
) SELECT
  estimated_trips.real_trip_id,
  estimated_trips.test_execution_id,
  estimated_trips.estimated_arrival_time,
  estimated_trips.estimated_trip_duration_seconds,
  estimated_trips.trip_duration_absolute_error_percent,
  estimated_trips.is_longer_than_real_trip
  FROM json_populate_recordset(null::taxiestimate.estimated_trips, $1) AS estimated_trips`;

export const insertTestExecutionReport = `
INSERT INTO taxiestimate.test_execution_reports (
  test_execution_id,
  sample_id,
  estimated_with,
  created_at,
  created_by,
  error_count,
  all_trip_duration_absolute_error_percent_p50,
  all_trip_duration_absolute_error_percent_p90,
  all_trip_duration_absolute_error_percent_p95,
  all_trip_duration_absolute_error_percent_p99,
  all_trip_duration_absolute_error_percent_max,
  all_trip_duration_absolute_error_percent_avg,
  all_trip_duration_absolute_error_percent_stddev,
  all_trip_count,
  longer_than_real_trip_duration_absolute_error_percent_p50,
  longer_than_real_trip_duration_absolute_error_percent_p90,
  longer_than_real_trip_duration_absolute_error_percent_p95,
  longer_than_real_trip_duration_absolute_error_percent_p99,
  longer_than_real_trip_duration_absolute_error_percent_max,
  longer_than_real_trip_duration_absolute_error_percent_avg,
  longer_than_real_trip_duration_absolute_error_percent_stddev,
  longer_than_real_trip_count,
  shorter_than_real_trip_duration_absolute_error_percent_p50,
  shorter_than_real_trip_duration_absolute_error_percent_p90,
  shorter_than_real_trip_duration_absolute_error_percent_p95,
  shorter_than_real_trip_duration_absolute_error_percent_p99,
  shorter_than_real_trip_duration_absolute_error_percent_max,
  shorter_than_real_trip_duration_absolute_error_percent_avg,
  shorter_than_real_trip_duration_absolute_error_percent_stddev,
  shorter_than_real_trip_count
) SELECT
  test_execution_reports.test_execution_id,
  test_execution_reports.sample_id,
  test_execution_reports.estimated_with,
  test_execution_reports.created_at,
  test_execution_reports.created_by,
  test_execution_reports.error_count,
  test_execution_reports.all_trip_duration_absolute_error_percent_p50,
  test_execution_reports.all_trip_duration_absolute_error_percent_p90,
  test_execution_reports.all_trip_duration_absolute_error_percent_p95,
  test_execution_reports.all_trip_duration_absolute_error_percent_p99,
  test_execution_reports.all_trip_duration_absolute_error_percent_max,
  test_execution_reports.all_trip_duration_absolute_error_percent_avg,
  test_execution_reports.all_trip_duration_absolute_error_percent_stddev,
  test_execution_reports.all_trip_count,
  test_execution_reports.longer_than_real_trip_duration_absolute_error_percent_p50,
  test_execution_reports.longer_than_real_trip_duration_absolute_error_percent_p90,
  test_execution_reports.longer_than_real_trip_duration_absolute_error_percent_p95,
  test_execution_reports.longer_than_real_trip_duration_absolute_error_percent_p99,
  test_execution_reports.longer_than_real_trip_duration_absolute_error_percent_max,
  test_execution_reports.longer_than_real_trip_duration_absolute_error_percent_avg,
  test_execution_reports.longer_than_real_trip_duration_absolute_error_percent_stddev,
  test_execution_reports.longer_than_real_trip_count,
  test_execution_reports.shorter_than_real_trip_duration_absolute_error_percent_p50,
  test_execution_reports.shorter_than_real_trip_duration_absolute_error_percent_p90,
  test_execution_reports.shorter_than_real_trip_duration_absolute_error_percent_p95,
  test_execution_reports.shorter_than_real_trip_duration_absolute_error_percent_p99,
  test_execution_reports.shorter_than_real_trip_duration_absolute_error_percent_max,
  test_execution_reports.shorter_than_real_trip_duration_absolute_error_percent_avg,
  test_execution_reports.shorter_than_real_trip_duration_absolute_error_percent_stddev,
  test_execution_reports.shorter_than_real_trip_count
  FROM json_populate_recordset(null::taxiestimate.test_execution_reports, $1) AS test_execution_reports RETURNING *`;

export const selectInsertedTestExecution = `SELECT id from taxiestimate.test_executions WHERE id = $1::int`;
