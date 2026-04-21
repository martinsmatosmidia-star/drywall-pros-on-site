import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { NumInput } from "@/components/NumInput";
import { useCalcSettings, useCompanySettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/opcoes")({
  component: () => (<AuthGuard><Opcoes /></AuthGuard>),
  head: () => ({ meta: [{ title: "Opções — Drywall Pro" }] }),
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-primary">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Opcoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { settings, update: updateCalc } = useCalcSettings();
  const { company, update: updateCompany, reload: reloadCompany } = useCompanySettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!settings || !company) {
    return <div className="px-4 pt-10 text-center text-muted-foreground">Carregando...</div>;
  }

  const uploadLogo = async (f: File) => {
    if (!user) return;
    setUploading(true);
    const ext = f.name.split(".").pop() || "png";
    const path = `${user.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, f, { upsert: true });
    if (error) {
      toast.error("Erro ao subir logo: " + error.message);
      setUploading(false);
      return;
    }
    const { data: signed } = await supabase.storage.from("logos").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signed?.signedUrl) {
      await updateCompany({ logo_url: signed.signedUrl });
      reloadCompany();
      toast.success("Logo atualizada");
    }
    setUploading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-4 px-4 pt-6">
      <h1 className="text-2xl font-black text-foreground">Opções</h1>

      {/* Empresa */}
      <Section title="Dados da empresa">
        <Field label="Nome da empresa">
          <input
            type="text"
            value={company.name}
            onChange={(e) => updateCompany({ name: e.target.value })}
            maxLength={100}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus:border-primary focus:outline-none"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Telefone">
            <input
              type="tel"
              value={company.phone}
              onChange={(e) => updateCompany({ phone: e.target.value })}
              maxLength={30}
              className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus:border-primary focus:outline-none"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={company.email}
              onChange={(e) => updateCompany({ email: e.target.value })}
              maxLength={100}
              className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus:border-primary focus:outline-none"
            />
          </Field>
        </div>
        <Field label="Observações para o orçamento">
          <textarea
            value={company.notes}
            onChange={(e) => updateCompany({ notes: e.target.value })}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </Field>
        <Field label="Logo (PNG/JPG)">
          <div className="flex items-center gap-3">
            {company.logo_url && (
              <img src={company.logo_url} alt="Logo" className="h-16 w-16 rounded-lg border border-border bg-white object-contain" />
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="touch-target flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-3 text-sm font-semibold text-foreground"
              disabled={uploading}
            >
              <Upload className="h-4 w-4" /> {uploading ? "Subindo..." : "Enviar logo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadLogo(f);
              }}
            />
          </div>
        </Field>
      </Section>

      {/* Perfil */}
      <Section title="Perfil (montante/guia)">
        <div className="grid grid-cols-3 gap-2">
          {[48, 70, 90].map((mm) => (
            <button
              key={mm}
              onClick={() => updateCalc({ perfil_mm: mm })}
              className={`touch-target rounded-xl border-2 font-bold ${
                Number(settings.perfil_mm) === mm
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              {mm} mm
            </button>
          ))}
        </div>
      </Section>

      {/* Placa */}
      <Section title="Tipo de placa">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "ST", l: "ST" },
            { v: "RU", l: "RU" },
            { v: "RF", l: "RF" },
            { v: "PERF_ST", l: "Performance ST" },
            { v: "PERF_RU", l: "Performance RU" },
          ].map((p) => (
            <button
              key={p.v}
              onClick={() => updateCalc({ placa_tipo: p.v })}
              className={`touch-target rounded-xl border-2 px-3 text-sm font-bold ${
                settings.placa_tipo === p.v
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Preço ST"><NumInput value={Number(settings.placa_preco_st)} onChange={(n) => updateCalc({ placa_preco_st: n })} suffix="R$" /></Field>
          <Field label="Preço RU"><NumInput value={Number(settings.placa_preco_ru)} onChange={(n) => updateCalc({ placa_preco_ru: n })} suffix="R$" /></Field>
          <Field label="Preço RF"><NumInput value={Number(settings.placa_preco_rf)} onChange={(n) => updateCalc({ placa_preco_rf: n })} suffix="R$" /></Field>
          <Field label="Perf. ST"><NumInput value={Number(settings.placa_preco_perf_st)} onChange={(n) => updateCalc({ placa_preco_perf_st: n })} suffix="R$" /></Field>
          <Field label="Perf. RU"><NumInput value={Number(settings.placa_preco_perf_ru)} onChange={(n) => updateCalc({ placa_preco_perf_ru: n })} suffix="R$" /></Field>
        </div>
      </Section>

      {/* Fita */}
      <Section title="Fita (exclusiva)">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateCalc({ fita_tipo: "papel" })}
            className={`touch-target rounded-xl border-2 font-bold ${
              settings.fita_tipo === "papel" ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface text-foreground"
            }`}
          >
            Papel (150m)
          </button>
          <button
            onClick={() => updateCalc({ fita_tipo: "tela" })}
            className={`touch-target rounded-xl border-2 font-bold ${
              settings.fita_tipo === "tela" ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface text-foreground"
            }`}
          >
            Tela (90m)
          </button>
        </div>
      </Section>

      {/* Parâmetros */}
      <Section title="Parâmetros de cálculo">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Espaçamento">
            <select
              value={String(settings.espacamento)}
              onChange={(e) => updateCalc({ espacamento: Number(e.target.value) })}
              className="h-14 w-full rounded-xl border-2 border-border bg-surface px-3 text-base font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="0.6">0,60 m</option>
              <option value="0.4">0,40 m</option>
            </select>
          </Field>
          <Field label="Perda (%)"><NumInput value={Number(settings.perda_pct)} onChange={(n) => updateCalc({ perda_pct: n })} suffix="%" max={50} /></Field>
          <Field label="Parafusos/placa"><NumInput value={Number(settings.parafusos_por_placa)} onChange={(n) => updateCalc({ parafusos_por_placa: n })} /></Field>
          <Field label="Massa m²/balde"><NumInput value={Number(settings.massa_m2_balde)} onChange={(n) => updateCalc({ massa_m2_balde: n })} /></Field>
        </div>
      </Section>

      {/* Preços */}
      <Section title="Preços de materiais (R$)">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Montante"><NumInput value={Number(settings.preco_montante)} onChange={(n) => updateCalc({ preco_montante: n })} suffix="R$" /></Field>
          <Field label="Guia"><NumInput value={Number(settings.preco_guia)} onChange={(n) => updateCalc({ preco_guia: n })} suffix="R$" /></Field>
          <Field label="Parafuso (un)"><NumInput value={Number(settings.preco_parafuso)} onChange={(n) => updateCalc({ preco_parafuso: n })} suffix="R$" /></Field>
          <Field label="Bucha"><NumInput value={Number(settings.preco_bucha)} onChange={(n) => updateCalc({ preco_bucha: n })} suffix="R$" /></Field>
          <Field label="Massa (balde)"><NumInput value={Number(settings.preco_massa)} onChange={(n) => updateCalc({ preco_massa: n })} suffix="R$" /></Field>
          <Field label="Fita (rolo)"><NumInput value={Number(settings.preco_fita)} onChange={(n) => updateCalc({ preco_fita: n })} suffix="R$" /></Field>
          <Field label="Tabica"><NumInput value={Number(settings.preco_tabica)} onChange={(n) => updateCalc({ preco_tabica: n })} suffix="R$" /></Field>
          <Field label="F530"><NumInput value={Number(settings.preco_f530)} onChange={(n) => updateCalc({ preco_f530: n })} suffix="R$" /></Field>
          <Field label="Regulador"><NumInput value={Number(settings.preco_regulador)} onChange={(n) => updateCalc({ preco_regulador: n })} suffix="R$" /></Field>
          <Field label="Arame (kg)"><NumInput value={Number(settings.preco_arame)} onChange={(n) => updateCalc({ preco_arame: n })} suffix="R$" /></Field>
        </div>
      </Section>

      {/* Mão de obra */}
      <Section title="Mão de obra (R$/m²)">
        <div className="grid grid-cols-3 gap-2">
          <Field label="Parede"><NumInput value={Number(settings.mo_parede)} onChange={(n) => updateCalc({ mo_parede: n })} suffix="R$" /></Field>
          <Field label="Contra"><NumInput value={Number(settings.mo_contraparede)} onChange={(n) => updateCalc({ mo_contraparede: n })} suffix="R$" /></Field>
          <Field label="Forro"><NumInput value={Number(settings.mo_forro)} onChange={(n) => updateCalc({ mo_forro: n })} suffix="R$" /></Field>
        </div>
        <Field label="Margem padrão (%)">
          <NumInput value={Number(settings.margem_pct)} onChange={(n) => updateCalc({ margem_pct: n })} suffix="%" max={500} />
        </Field>
      </Section>

      <button
        onClick={logout}
        className="touch-target flex w-full items-center justify-center gap-2 rounded-xl border-2 border-destructive/30 bg-destructive/10 text-sm font-bold text-destructive"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </div>
  );
}
