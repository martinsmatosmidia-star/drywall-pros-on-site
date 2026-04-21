import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/AuthGuard";
import { useDraft } from "@/hooks/useDraft";
import { useCalcSettings } from "@/hooks/useSettings";
import { computeTotals, buildMateriais, placaPrecoFor } from "@/lib/calc";

export const Route = createFileRoute("/materiais")({
  component: () => (<AuthGuard><Materiais /></AuthGuard>),
  head: () => ({ meta: [{ title: "Materiais — Drywall Pro" }] }),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Materiais() {
  const { items } = useDraft();
  const { settings, loading } = useCalcSettings();

  if (loading || !settings) {
    return <div className="px-4 pt-10 text-center text-muted-foreground">Carregando...</div>;
  }

  const totals = computeTotals(items, {
    espacamento: Number(settings.espacamento),
    perda_pct: Number(settings.perda_pct),
    parafusos_por_placa: Number(settings.parafusos_por_placa),
    massa_m2_balde: Number(settings.massa_m2_balde),
    fita_tipo: settings.fita_tipo,
  });

  const lines = buildMateriais(
    totals,
    {
      placa: placaPrecoFor(settings.placa_tipo, settings),
      montante: Number(settings.preco_montante),
      guia: Number(settings.preco_guia),
      parafuso: Number(settings.preco_parafuso),
      massa: Number(settings.preco_massa),
      fita: Number(settings.preco_fita),
      bucha: Number(settings.preco_bucha),
      tabica: Number(settings.preco_tabica),
      f530: Number(settings.preco_f530),
      regulador: Number(settings.preco_regulador),
      arame: Number(settings.preco_arame),
    },
    settings.fita_tipo
  );

  const totalGeral = lines.reduce((acc, l) => acc + l.total, 0);

  const showPerdaWarning = Number(settings.perda_pct) > 15;

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-1 text-2xl font-black text-foreground">Materiais</h1>
      <p className="mb-6 text-sm text-muted-foreground">Calculado em tempo real conforme seus itens.</p>

      {showPerdaWarning && (
        <div className="mb-4 rounded-xl bg-warning/15 px-4 py-3 text-sm font-medium text-warning">
          ⚠ Perda configurada acima de 15% — verifique nas Opções.
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Nenhum item adicionado. Vá em Início e adicione paredes/forros.
        </div>
      ) : (
        <div className="space-y-2">
          {lines.map((l) => (
            <div key={l.nome} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-elevated">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{l.nome}</div>
                <div className="text-xs text-muted-foreground">
                  {l.quantidade} {l.unidade} × {brl(l.preco)}
                </div>
              </div>
              <div className="text-base font-bold text-primary">{brl(l.total)}</div>
            </div>
          ))}

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-primary px-4 py-4 shadow-glow">
            <div className="text-sm font-bold uppercase text-primary-foreground/80">Total Materiais</div>
            <div className="text-2xl font-black text-primary-foreground">{brl(totalGeral)}</div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-card px-3 py-3">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">Parede</div>
              <div className="text-sm font-bold text-foreground">{totals.area_parede.toFixed(1)} m²</div>
            </div>
            <div className="rounded-xl bg-card px-3 py-3">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">Contra</div>
              <div className="text-sm font-bold text-foreground">{totals.area_contraparede.toFixed(1)} m²</div>
            </div>
            <div className="rounded-xl bg-card px-3 py-3">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">Forro</div>
              <div className="text-sm font-bold text-foreground">{totals.area_forro.toFixed(1)} m²</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
