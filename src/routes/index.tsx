import { createFileRoute } from "@tanstack/react-router";
import { Plus, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { Logo } from "@/components/Logo";
import { NumInput } from "@/components/NumInput";
import { ItemCard } from "@/components/ItemCard";
import { useDraft } from "@/hooks/useDraft";
import type { Item } from "@/lib/calc";

export const Route = createFileRoute("/")({
  component: () => (
    <AuthGuard>
      <Home />
    </AuthGuard>
  ),
  head: () => ({ meta: [{ title: "Drywall Pro — Calculadora" }] }),
});

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function Home() {
  const draft = useDraft();

  const addParede = () => {
    draft.addItem({
      id: uid(),
      tipo: "parede",
      comprimento: draft.comprimentoPadrao || 0,
      altura: draft.alturaPadrao || 2.7,
      aberturas: [],
    });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(20);
  };
  const addContra = () => {
    draft.addItem({
      id: uid(),
      tipo: "contraparede",
      comprimento: draft.comprimentoPadrao || 0,
      altura: draft.alturaPadrao || 2.7,
      aberturas: [],
    });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(20);
  };
  const addForro = () => {
    draft.addItem({
      id: uid(),
      tipo: "forro",
      comprimento: draft.comprimentoPadrao || 0,
      largura: 0,
      altura_laje: 2.8,
      altura_forro: draft.alturaPadrao || 2.6,
    });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(20);
  };

  const hasContent = draft.items.length > 0 || !!draft.cliente || !!draft.obra;
  const novoOrcamento = () => {
    if (hasContent && !confirm("Limpar o rascunho atual e iniciar um novo orçamento?")) return;
    draft.reset();
    toast.success("Novo orçamento iniciado");
  };

  return (
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <Logo size={40} />
        {hasContent && (
          <button
            onClick={novoOrcamento}
            className="flex items-center gap-1 rounded-lg bg-primary/15 px-3 py-2 text-sm font-semibold text-primary"
          >
            <FilePlus2 className="h-4 w-4" /> Novo
          </button>
        )}
      </div>

      {/* Cliente / Obra */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cliente</label>
          <input
            type="text"
            value={draft.cliente}
            onChange={(e) => draft.setCliente(e.target.value)}
            placeholder="Nome do cliente"
            maxLength={100}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Obra</label>
          <input
            type="text"
            value={draft.obra}
            onChange={(e) => draft.setObra(e.target.value)}
            placeholder="Endereço/obra"
            maxLength={100}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Padrões */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-surface/50 p-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Altura padrão</label>
          <NumInput value={draft.alturaPadrao || ""} onChange={draft.setAlturaPadrao} suffix="m" max={15} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comprimento</label>
          <NumInput value={draft.comprimentoPadrao || ""} onChange={draft.setComprimentoPadrao} suffix="m" max={100} />
        </div>
      </div>

      {/* Botões grandes */}
      <div className="mb-6 grid gap-3">
        <button
          onClick={addParede}
          className="touch-target w-full rounded-2xl bg-gradient-primary px-6 text-base font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98]"
        >
          <span className="flex items-center justify-center gap-2"><Plus className="h-5 w-5" /> Adicionar Parede</span>
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={addContra}
            className="touch-target rounded-2xl border-2 border-accent/40 bg-accent/10 px-4 text-sm font-bold text-accent active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Contraparede</span>
          </button>
          <button
            onClick={addForro}
            className="touch-target rounded-2xl border-2 border-success/40 bg-success/10 px-4 text-sm font-bold text-success active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Forro</span>
          </button>
        </div>
      </div>

      {/* Resumo */}
      {draft.items.length > 0 && (() => {
        const paredes = draft.items.filter((i) => i.tipo === "parede").length;
        const contras = draft.items.filter((i) => i.tipo === "contraparede").length;
        const forros = draft.items.filter((i) => i.tipo === "forro").length;
        const totalM2 = draft.items.reduce((acc, i) => {
          if (i.tipo === "forro") return acc + (i.comprimento || 0) * (i.largura || 0);
          const ab = (i.aberturas || []).reduce((a, o) => a + (o.largura || 0) * (o.altura || 0), 0);
          return acc + Math.max(0, (i.comprimento || 0) * (i.altura || 0) - ab);
        }, 0);
        return (
          <div className="mb-4 rounded-2xl bg-surface px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                {draft.items.length} {draft.items.length === 1 ? "item" : "itens"}
              </span>
              <span className="font-bold text-primary">{totalM2.toFixed(1)} m² total</span>
            </div>
            <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
              {paredes > 0 && <span>{paredes} parede{paredes > 1 ? "s" : ""}</span>}
              {contras > 0 && <span>{contras} contraparede{contras > 1 ? "s" : ""}</span>}
              {forros > 0 && <span>{forros} forro{forros > 1 ? "s" : ""}</span>}
            </div>
          </div>
        );
      })()}

      {/* Lista de itens */}
      <div className="space-y-3">
        {draft.items.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Adicione paredes, contraparedes ou forros para começar.
          </div>
        )}
        {draft.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onUpdate={(patch) => draft.updateItem(item.id, patch as Partial<Item>)}
            onRemove={() => draft.removeItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
