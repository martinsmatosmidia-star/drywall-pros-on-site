import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type CalcSettings = {
  user_id: string;
  perfil_mm: number;
  placa_tipo: string;
  placa_preco_st: number;
  placa_preco_ru: number;
  placa_preco_rf: number;
  placa_preco_perf_st: number;
  placa_preco_perf_ru: number;
  fita_tipo: "papel" | "tela";
  espacamento: number;
  perda_pct: number;
  parafusos_por_placa: number;
  massa_m2_balde: number;
  preco_montante: number;
  preco_guia: number;
  preco_montante_48: number;
  preco_montante_70: number;
  preco_montante_90: number;
  preco_guia_48: number;
  preco_guia_70: number;
  preco_guia_90: number;
  preco_parafuso: number;
  preco_massa: number;
  preco_fita: number;
  preco_bucha: number;
  preco_tabica: number;
  preco_cantoneira: number;
  preco_f530: number;
  preco_regulador: number;
  preco_arame: number;
  mo_parede: number;
  mo_contraparede: number;
  mo_forro: number;
  margem_pct: number;
};

export type CompanySettings = {
  user_id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  logo_url: string | null;
};

export function useCalcSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CalcSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase.from("calc_settings").select("*").eq("user_id", user.id).maybeSingle();
    if (data) setSettings(data as unknown as CalcSettings);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const update = async (patch: Partial<CalcSettings>) => {
    if (!user) return;
    setSettings((s) => (s ? { ...s, ...patch } : s));
    await supabase.from("calc_settings").update(patch).eq("user_id", user.id);
  };

  return { settings, loading, update, reload };
}

export function useCompanySettings() {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!user) return;
    const { data } = await supabase.from("company_settings").select("*").eq("user_id", user.id).maybeSingle();
    if (data) setCompany(data as unknown as CompanySettings);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const update = async (patch: Partial<CompanySettings>) => {
    if (!user) return;
    setCompany((c) => (c ? { ...c, ...patch } : c));
    await supabase.from("company_settings").update(patch).eq("user_id", user.id);
  };

  return { company, loading, update, reload };
}
