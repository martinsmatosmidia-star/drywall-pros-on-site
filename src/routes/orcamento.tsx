import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileDown, Share2, Save, History, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { useDraft } from "@/hooks/useDraft";
import { useCalcSettings, useCompanySettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { computeTotals, buildMateriais, placaPrecoFor, montantePrecoFor, guiaPrecoFor, type Item } from "@/lib/calc";
import { generateQuotePDF, pdfFileName } from "@/lib/pdf";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/orcamento")({
  component: () => (<AuthGuard><Orcamento /></AuthGuard>),
  head: () => ({ meta: [{ title: "Orçamento — Drywall Pro" }] }),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Quote = {
  id: string;
  cliente: string;
  obra: string;
  total: number;
  created_at: string;
  items_snapshot: Item[];
};

function Orcamento() {
  const { user } = useAuth();
  const draft = useDraft();
  const { settings } = useCalcSettings();
  const { company } = useCompanySettings();
  const [margemPct, setMargemPct] = useState<number>(20);
  const [history, setHistory] = useState<Quote[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (settings) setMargemPct(Number(settings.margem_pct));
  }, [settings]);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quotes")
      .select("id,cliente,obra,total,created_at,items_snapshot")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory((data as unknown as Quote[]) || []);
  };

  useEffect(() => { loadHistory(); /* eslint-disable-next-line */ }, [user?.id]);

  if (!settings || !company) {
    return <div className="px-4 pt-10 text-center text-muted-foreground">Carregando...</div>;
  }

  const totals = computeTotals(draft.items, {
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
      montante: montantePrecoFor(Number(settings.perfil_mm), settings),
      guia: guiaPrecoFor(Number(settings.perfil_mm), settings),
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

  const valorMaterial = lines.reduce((a, l) => a + l.total, 0);
  const valorMaoObra =
    totals.area_parede * Number(settings.mo_parede) +
    totals.area_contraparede * Number(settings.mo_contraparede) +
    totals.area_forro * Number(settings.mo_forro);
  const subtotal = valorMaterial + valorMaoObra;
  const valorFinal = subtotal * (1 + (margemPct || 0) / 100);

  const margemNegativa = margemPct < 0;

  const sharePDF = async () => {
    if (draft.items.length === 0) {
      toast.error("Adicione itens antes de gerar o PDF");
      return;
    }
    const blob = await generateQuotePDF(company, {
      cliente: draft.cliente,
      obra: draft.obra,
      totals,
      valorFinal,
    });
    const filename = pdfFileName(draft.cliente);
    const file = new File([blob], filename, { type: "application/pdf" });

    // Try Web Share
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Orçamento Drywall",
          text: `Orçamento para ${draft.cliente || "cliente"}`,
        });
        return;
      } catch {/* user cancelled */}
    }
    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareWhatsApp = async () => {
    if (draft.items.length === 0) {
      toast.error("Adicione itens antes de compartilhar");
      return;
    }
    const msg = [
      `*Orçamento Drywall — ${company.name || "Drywall Pro"}*`,
      "",
      `Cliente: ${draft.cliente || "—"}`,
      draft.obra ? `Obra: ${draft.obra}` : "",
      "",
      totals.area_parede > 0 ? `• ${totals.area_parede.toFixed(2)} m² Parede` : "",
      totals.area_contraparede > 0 ? `• ${totals.area_contraparede.toFixed(2)} m² Contraparede` : "",
      totals.area_forro > 0 ? `• ${totals.area_forro.toFixed(2)} m² Forro` : "",
      "",
      `*Valor total: ${brl(valorFinal)}*`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const saveQuote = async () => {
    if (!user) return;
    if (draft.items.length === 0) {
      toast.error("Adicione itens antes de salvar");
      return;
    }
    const payload = {
      user_id: user.id,
      cliente: draft.cliente,
      obra: draft.obra,
      total: valorFinal,
      settings_snapshot: { ...settings, margem_pct: margemPct },
      items_snapshot: draft.items as unknown as object,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("quotes") as any).insert(payload);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Orçamento salvo!");
    loadHistory();
  };

  const loadQuote = (q: Quote) => {
    draft.loadFromQuote(q.cliente, q.obra, q.items_snapshot);
    setShowHistory(false);
    toast.success("Orçamento carregado");
  };

  const duplicateQuote = (q: Quote) => {
    draft.loadFromQuote(q.cliente + " (cópia)", q.obra, q.items_snapshot);
    setShowHistory(false);
    toast.success("Orçamento duplicado");
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Excluir este orçamento?")) return;
    await supabase.from("quotes").delete().eq("id", id);
    loadHistory();
  };

  return (
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Orçamento</h1>
        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-1 rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-foreground"
        >
          <History className="h-4 w-4" /> Histórico
        </button>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-card p-4 shadow-elevated">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Materiais</span>
            <span className="font-bold text-foreground">{brl(valorMaterial)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mão de obra</span>
            <span className="font-bold text-foreground">{brl(valorMaoObra)}</span>
          </div>
          <div className="my-3 h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Subtotal</span>
            <span className="font-bold text-foreground">{brl(subtotal)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4">
          <label className="mb-2 block text-sm font-semibold text-foreground">Margem (%)</label>
          <input
            type="number"
            inputMode="decimal"
            value={margemPct}
            onChange={(e) => setMargemPct(Number(e.target.value))}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-base font-semibold text-foreground focus:border-primary focus:outline-none"
          />
          {margemNegativa && (
            <p className="mt-2 text-xs font-medium text-warning">⚠ Margem negativa — verifique.</p>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-primary p-5 shadow-glow">
          <div className="text-sm font-bold uppercase text-primary-foreground/80">Valor Final</div>
          <div className="mt-1 text-4xl font-black text-primary-foreground">{brl(valorFinal)}</div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={saveQuote}
            className="touch-target flex flex-col items-center justify-center rounded-xl border-2 border-border bg-card text-xs font-bold text-foreground active:scale-95"
          >
            <Save className="mb-1 h-5 w-5" /> Salvar
          </button>
          <button
            onClick={sharePDF}
            className="touch-target flex flex-col items-center justify-center rounded-xl bg-accent text-xs font-bold text-accent-foreground active:scale-95"
          >
            <FileDown className="mb-1 h-5 w-5" /> PDF
          </button>
          <button
            onClick={shareWhatsApp}
            className="touch-target flex flex-col items-center justify-center rounded-xl bg-success text-xs font-bold text-success-foreground active:scale-95"
          >
            <Share2 className="mb-1 h-5 w-5" /> WhatsApp
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={() => setShowHistory(false)}>
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-5 pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">Histórico</h2>
              <button onClick={() => setShowHistory(false)} className="text-muted-foreground">Fechar</button>
            </div>
            {history.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum orçamento salvo.</p>
            ) : (
              <div className="space-y-2">
                {history.map((q) => (
                  <div key={q.id} className="rounded-xl bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-bold text-foreground">{q.cliente || "Sem cliente"}</div>
                        <div className="text-xs text-muted-foreground">{q.obra || "—"}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(q.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div className="text-lg font-black text-primary">{brl(Number(q.total))}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => loadQuote(q)} className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground">Abrir</button>
                      <button onClick={() => duplicateQuote(q)} className="rounded-lg bg-surface px-3 py-2 text-xs font-bold text-foreground">
                        <Copy className="h-3 w-3" />
                      </button>
                      <button onClick={() => deleteQuote(q.id)} className="rounded-lg bg-destructive/15 px-3 py-2 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
