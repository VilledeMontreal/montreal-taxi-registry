// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class EstimationArguments {
  createdBy: string;
  estimatedWith: string;
  sampleId: number;
  testExecutionId?: number;
}

export class RealTrip {
  id: string;
  sample_id: number;
  departure_time: string;
  departure_lat: number;
  departure_lon: number;
  arrival_time: string;
  arrival_lat: number;
  arrival_lon: number;
  duration_seconds: number;
  duration_above_speed_threshold_seconds: number;
  duration_below_speed_threshold_seconds: number;
  distance_meters: number;
  distance_above_speed_threshold_meters: number;
  distance_below_speed_threshold_meters: number;
  price_cad: number;
}

export class EstimatedTrip {
  id?: number;
  real_trip_id: number;
  test_execution_id: number;
  estimated_arrival_time: string;
  estimated_trip_duration_seconds: number;
  trip_duration_absolute_error_percent: number;
  is_longer_than_real_trip: boolean;
}

export class TestExecution {
  id?: number;
  sample_id: number;
  estimated_with: string;
  created_at: Date;
  created_by: string;
}
export class TestExecutionReport {
  id?: number;
  test_execution_id: number;
  sample_id: number;
  estimated_with: string;
  created_at: Date;
  created_by: string;
  error_count: number;
  all_trip_duration_absolute_error_percent_p50: number;
  all_trip_duration_absolute_error_percent_p90: number;
  all_trip_duration_absolute_error_percent_p95: number;
  all_trip_duration_absolute_error_percent_p99: number;
  all_trip_duration_absolute_error_percent_max: number;
  all_trip_duration_absolute_error_percent_avg: number;
  all_trip_duration_absolute_error_percent_stddev: number;
  all_trip_count: number;
  longer_than_real_trip_duration_absolute_error_percent_p50: number;
  longer_than_real_trip_duration_absolute_error_percent_p90: number;
  longer_than_real_trip_duration_absolute_error_percent_p95: number;
  longer_than_real_trip_duration_absolute_error_percent_p99: number;
  longer_than_real_trip_duration_absolute_error_percent_max: number;
  longer_than_real_trip_duration_absolute_error_percent_avg: number;
  longer_than_real_trip_duration_absolute_error_percent_stddev: number;
  longer_than_real_trip_count: number;
  shorter_than_real_trip_duration_absolute_error_percent_p50: number;
  shorter_than_real_trip_duration_absolute_error_percent_p90: number;
  shorter_than_real_trip_duration_absolute_error_percent_p95: number;
  shorter_than_real_trip_duration_absolute_error_percent_p99: number;
  shorter_than_real_trip_duration_absolute_error_percent_max: number;
  shorter_than_real_trip_duration_absolute_error_percent_avg: number;
  shorter_than_real_trip_duration_absolute_error_percent_stddev: number;
  shorter_than_real_trip_count: number;
}
