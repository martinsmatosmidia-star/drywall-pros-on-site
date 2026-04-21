
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP POLICY IF EXISTS "logos_select_public" ON storage.objects;
CREATE POLICY "logos_select_own" ON storage.objects FOR SELECT USING (
  bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]
);
