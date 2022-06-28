ALTER TABLE public.hail
    ADD COLUMN read_only_after timestamp without time zone DEFAULT null;