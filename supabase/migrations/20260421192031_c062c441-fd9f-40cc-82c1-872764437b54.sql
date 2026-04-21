
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Company settings
CREATE TABLE public.company_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_select_own" ON public.company_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "company_insert_own" ON public.company_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "company_update_own" ON public.company_settings FOR UPDATE USING (auth.uid() = user_id);

-- Calc settings
CREATE TABLE public.calc_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  perfil_mm INT NOT NULL DEFAULT 70,
  placa_tipo TEXT NOT NULL DEFAULT 'ST',
  placa_preco_st NUMERIC NOT NULL DEFAULT 36,
  placa_preco_ru NUMERIC NOT NULL DEFAULT 57,
  placa_preco_rf NUMERIC NOT NULL DEFAULT 80,
  placa_preco_perf_st NUMERIC NOT NULL DEFAULT 98,
  placa_preco_perf_ru NUMERIC NOT NULL DEFAULT 120,
  fita_tipo TEXT NOT NULL DEFAULT 'papel',
  espacamento NUMERIC NOT NULL DEFAULT 0.60,
  perda_pct NUMERIC NOT NULL DEFAULT 7,
  parafusos_por_placa INT NOT NULL DEFAULT 30,
  massa_m2_balde NUMERIC NOT NULL DEFAULT 23,
  preco_montante NUMERIC NOT NULL DEFAULT 25,
  preco_guia NUMERIC NOT NULL DEFAULT 22,
  preco_parafuso NUMERIC NOT NULL DEFAULT 0.10,
  preco_massa NUMERIC NOT NULL DEFAULT 90,
  preco_fita NUMERIC NOT NULL DEFAULT 35,
  preco_bucha NUMERIC NOT NULL DEFAULT 0.30,
  preco_tabica NUMERIC NOT NULL DEFAULT 18,
  preco_f530 NUMERIC NOT NULL DEFAULT 22,
  preco_regulador NUMERIC NOT NULL DEFAULT 3,
  preco_arame NUMERIC NOT NULL DEFAULT 25,
  mo_parede NUMERIC NOT NULL DEFAULT 35,
  mo_contraparede NUMERIC NOT NULL DEFAULT 30,
  mo_forro NUMERIC NOT NULL DEFAULT 40,
  margem_pct NUMERIC NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calc_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calc_select_own" ON public.calc_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "calc_insert_own" ON public.calc_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "calc_update_own" ON public.calc_settings FOR UPDATE USING (auth.uid() = user_id);

-- Quotes
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente TEXT NOT NULL DEFAULT '',
  obra TEXT NOT NULL DEFAULT '',
  total NUMERIC NOT NULL DEFAULT 0,
  settings_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_select_own" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "quotes_insert_own" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quotes_update_own" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "quotes_delete_own" ON public.quotes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX quotes_user_created_idx ON public.quotes(user_id, created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_company_updated BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_calc_updated BEFORE UPDATE ON public.calc_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile, company and calc_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.email, ''));
  INSERT INTO public.company_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.calc_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

CREATE POLICY "logos_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "logos_insert_own" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "logos_update_own" ON storage.objects FOR UPDATE USING (
  bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "logos_delete_own" ON storage.objects FOR DELETE USING (
  bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]
);
