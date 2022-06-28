CREATE SCHEMA "taxiestimate";

CREATE TABLE "taxiestimate"."samples" (
	"id" int4 NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar NULL,
	"created_at" timestamp without time zone NOT NULL,
	"created_by" varchar(256) NOT NULL,
	CONSTRAINT "samples_pkey" PRIMARY KEY (id)
);

CREATE TABLE "taxiestimate"."real_trips" (
	"id" serial NOT NULL,
	"sample_id" int4 NOT NULL,
	"departure_time" timestamp without time zone NOT NULL,
	"departure_lat" float8 NOT NULL,
	"departure_lon" float8 NOT NULL,
	"arrival_time" timestamp without time zone NOT NULL,
	"arrival_lat" float8 NOT NULL,
	"arrival_lon" float8 NOT NULL,
	"duration_seconds" int4 NOT NULL,
	"duration_above_speed_threshold_seconds" int4 NULL,
	"duration_below_speed_threshold_seconds" int4 NULL,
	"distance_meters" int4 NOT NULL,
	"distance_above_speed_threshold_meters" int4 NULL,
	"distance_below_speed_threshold_meters" int4 NULL,
	"price_cad" numeric(6, 2) NULL,
	CONSTRAINT "real_trips_pkey" PRIMARY KEY (id)
);

CREATE TABLE "taxiestimate"."test_executions" (
	"id" serial NOT NULL,
	"sample_id" int4 NOT NULL,
	"estimated_with" varchar(256) NOT NULL,
	"created_at" timestamp without time zone NOT NULL,
	"created_by" varchar(256) NOT NULL,
	CONSTRAINT "test_execution_pkey" PRIMARY KEY (id)
);

CREATE TABLE "taxiestimate"."estimated_trips" (
	"id" serial NOT NULL,
	"real_trip_id" int4 NOT NULL,
	"test_execution_id" int4 NOT NULL,
	"estimated_arrival_time" timestamp without time zone NOT NULL,
	"estimated_trip_duration" int4 NOT NULL,
	"duration_absolute_error_percent" float8 NOT NULL,
	"is_longer_than_real_trip" bool NOT NULL,
	CONSTRAINT "estimated_trips_pkey" PRIMARY KEY (id)
);

CREATE TABLE "taxiestimate"."test_execution_reports" (
	"id" serial NOT NULL,
	"test_execution_id" int4 NOT NULL,
	"sample_id" int4 NOT NULL,
	"estimated_with" varchar(256) NOT NULL,
	"created_at" timestamp without time zone NOT NULL,
	"created_by" varchar(256) NOT NULL,
	"error_count" int4 NOT NULL,
	"all_trip_duration_absolute_error_percent_p50" float8 NOT NULL,
	"all_trip_duration_absolute_error_percent_p90" float8 NOT NULL,
	"all_trip_duration_absolute_error_percent_p95" float8 NOT NULL,
	"all_trip_duration_absolute_error_percent_p99" float8 NOT NULL,
	"all_trip_duration_absolute_error_percent_max" float8 NOT NULL,
	"all_trip_duration_absolute_error_percent_avg" float8 NOT NULL,
	"all_trip_duration_absolute_error_percent_stddev" float8 NOT NULL,
	"all_trip_count" int4 NOT NULL,
	"longer_than_real_trip_duration_absolute_error_percent_p50" float8 NOT NULL,
	"longer_than_real_trip_duration_absolute_error_percent_p90" float8 NOT NULL,
	"longer_than_real_trip_duration_absolute_error_percent_p95" float8 NOT NULL,
	"longer_than_real_trip_duration_absolute_error_percent_p99" float8 NOT NULL,
	"longer_than_real_trip_duration_absolute_error_percent_max" float8 NOT NULL,
	"longer_than_real_trip_duration_absolute_error_percent_avg" float8 NOT NULL,
	"longer_than_real_trip_duration_absolute_error_percent_stddev" float8 NOT NULL,
	"longer_than_real_trip_count" int4 NOT NULL,
	"shorter_than_real_trip_duration_absolute_error_percent_p50" float8 NOT NULL,
	"shorter_than_real_trip_duration_absolute_error_percent_p90" float8 NOT NULL,
	"shorter_than_real_trip_duration_absolute_error_percent_p95" float8 NOT NULL,
	"shorter_than_real_trip_duration_absolute_error_percent_p99" float8 NOT NULL,
	"shorter_than_real_trip_duration_absolute_error_percent_max" float8 NOT NULL,
	"shorter_than_real_trip_duration_absolute_error_percent_avg" float8 NOT NULL,
	"shorter_than_real_trip_duration_absolute_error_percent_stddev" float8 NOT NULL,
	"shorter_than_real_trip_count" int4 NOT NULL,
	CONSTRAINT "test_execution_reports_pkey" PRIMARY KEY (id)
);
