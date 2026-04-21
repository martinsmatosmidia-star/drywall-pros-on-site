import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { NumInput } from "@/components/NumInput";
import { useCalcSettings } from "@/hooks/useSettings";

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
  const { settings, update: updateCalc } = useCalcSettings();

  if (!settings) {
    return <div className="px-4 pt-10 text-center text-muted-foreground">Carregando...</div>;
  }

  const perfilAtivo = Number(settings.perfil_mm);

  return (
    <div className="space-y-4 px-4 pt-6">
      <h1 className="text-2xl font-black text-foreground">Opções</h1>

      {/* Perfil */}
      <Section title="Perfil (montante/guia)">
        <div className="grid grid-cols-3 gap-2">
          {[48, 70, 90].map((mm) => (
            <button
              key={mm}
              onClick={() => updateCalc({ perfil_mm: mm })}
              className={`touch-target rounded-xl border-2 font-bold ${
                perfilAtivo === mm
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

      {/* Preços de perfis por tamanho */}
      <Section title="Preços de perfis (R$ / barra)">
        <p className="text-[11px] text-muted-foreground">
          O preço usado nos cálculos segue o perfil ativo ({perfilAtivo} mm).
        </p>
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Montante</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mm: 48, key: "preco_montante_48" as const },
              { mm: 70, key: "preco_montante_70" as const },
              { mm: 90, key: "preco_montante_90" as const },
            ].map(({ mm, key }) => (
              <div key={key} className={`rounded-xl border-2 p-2 ${perfilAtivo === mm ? "border-primary bg-primary/10" : "border-border bg-surface"}`}>
                <div className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">{mm} mm</div>
                <NumInput value={Number(settings[key])} onChange={(n) => updateCalc({ [key]: n } as never)} suffix="R$" />
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Guia</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mm: 48, key: "preco_guia_48" as const },
              { mm: 70, key: "preco_guia_70" as const },
              { mm: 90, key: "preco_guia_90" as const },
            ].map(({ mm, key }) => (
              <div key={key} className={`rounded-xl border-2 p-2 ${perfilAtivo === mm ? "border-primary bg-primary/10" : "border-border bg-surface"}`}>
                <div className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">{mm} mm</div>
                <NumInput value={Number(settings[key])} onChange={(n) => updateCalc({ [key]: n } as never)} suffix="R$" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Preços demais materiais */}
      <Section title="Preços de materiais (R$)">
        <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
}
