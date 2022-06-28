ALTER TABLE public.hail 
ALTER COLUMN customer_id SET DEFAULT 'anonymous',
ALTER COLUMN added_via SET DEFAULT 'api',
ALTER COLUMN source SET DEFAULT 'added_by',
ALTER COLUMN initial_taxi_lat SET DEFAULT 0,
ALTER COLUMN initial_taxi_lon SET DEFAULT 0,
ALTER COLUMN change_to_timeout_customer SET DEFAULT NULL,
ALTER COLUMN change_to_timeout_taxi SET DEFAULT NULL,
ALTER COLUMN change_to_timeout_accepted_by_customer SET DEFAULT NULL,
ALTER COLUMN destination_lat SET DEFAULT 0,
ALTER COLUMN destination_lon SET DEFAULT 0,
ALTER COLUMN destination_lat_lon_ts SET DEFAULT NULL,
ALTER COLUMN added_at SET DEFAULT (now() at time zone 'utc')