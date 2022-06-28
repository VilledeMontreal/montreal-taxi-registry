UPDATE public.model SET name = 'legacy-not-provided' WHERE name IS null or name = ''

UPDATE public.constructor SET name = 'legacy-not-provided' WHERE name IS null or name = ''

UPDATE public.vehicle_description SET model_id = m.id
FROM public.model as m WHERE m.name IS NULL

UPDATE public.vehicle_description SET constructor_id = c.id
FROM public.constructor as c WHERE c.name IS NULL

ALTER TABLE public.vehicle_description ALTER constructor_id name SET NOT NULL

ALTER TABLE public.vehicle_description ALTER model_id name SET NOT NULL