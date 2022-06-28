ALTER TABLE public.hail
 DROP COLUMN  customer_id,
 DROP COLUMN  added_via,
 DROP COLUMN  source,
 DROP COLUMN  initial_taxi_lat,
 DROP COLUMN  initial_taxi_lon,
 DROP COLUMN  change_to_timeout_customer,
 DROP COLUMN  change_to_timeout_taxi,
 DROP COLUMN  change_to_timeout_accepted_by_customer,
 DROP COLUMN  destination_lat,
 DROP COLUMN  destination_lon,
 DROP COLUMN  destination_lat_lon_ts,
 DROP COLUMN  added_at;
  