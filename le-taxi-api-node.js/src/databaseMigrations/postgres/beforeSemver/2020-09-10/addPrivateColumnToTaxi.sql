ALTER TABLE public.taxi
  ADD COLUMN IF NOT EXISTS private boolean DEFAULT false;

UPDATE public.taxi 
  SET private = false;