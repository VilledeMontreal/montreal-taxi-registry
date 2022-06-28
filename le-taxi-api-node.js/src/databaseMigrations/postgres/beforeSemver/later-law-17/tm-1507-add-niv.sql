ALTER TABLE public.vehicle_description
  ADD COLUMN IF NOT EXISTS vehicle_identification_number varchar(255);
