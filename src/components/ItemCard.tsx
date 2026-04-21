import { useState } from "react";
import { Plus, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { NumInput } from "./NumInput";
import type { Item, WallItem, CeilingItem, Opening } from "@/lib/calc";
import { wallAreaBruta, wallAreaAberturas, wallAreaLiquida, ceilingArea } from "@/lib/calc";

const fmt = (n: number) => n.toFixed(2).replace(".", ",");

export function ItemCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: Item;
  onUpdate: (patch: Partial<Item>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [openingsOpen, setOpeningsOpen] = useState(false);

  const tipoBadge =
    item.tipo === "parede" ? "Parede" : item.tipo === "contraparede" ? "Contraparede" : "Forro";
  const tipoColor =
    item.tipo === "parede" ? "bg-primary/20 text-primary" :
    item.tipo === "contraparede" ? "bg-accent/20 text-accent" :
    "bg-success/20 text-success";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-elevated">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          <span className={`rounded-md px-2 py-1 text-[11px] font-bold uppercase ${tipoColor}`}>
            {tipoBadge}
          </span>
          {item.tipo !== "forro" && (
            <span className="text-sm font-semibold text-foreground">
              {fmt(wallAreaLiquida(item as WallItem))} m²
            </span>
          )}
          {item.tipo === "forro" && (
            <span className="text-sm font-semibold text-foreground">
              {fmt(ceilingArea(item as CeilingItem))} m²
            </span>
          )}
        </div>
        <button onClick={onRemove} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {item.tipo !== "forro" ? (
        <WallEditor item={item as WallItem} onUpdate={onUpdate} openingsOpen={openingsOpen} setOpeningsOpen={setOpeningsOpen} />
      ) : (
        <CeilingEditor item={item as CeilingItem} onUpdate={onUpdate} />
      )}

      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-surface"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Memória de cálculo
      </button>
      {expanded && <CalcMemory item={item} />}
    </div>
  );
}

function WallEditor({
  item,
  onUpdate,
  openingsOpen,
  setOpeningsOpen,
}: {
  item: WallItem;
  onUpdate: (p: Partial<Item>) => void;
  openingsOpen: boolean;
  setOpeningsOpen: (v: boolean) => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Comprimento (m)</label>
          <NumInput value={item.comprimento || ""} onChange={(n) => onUpdate({ comprimento: n })} max={100} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Altura (m)</label>
          <NumInput value={item.altura || ""} onChange={(n) => onUpdate({ altura: n })} max={15} />
        </div>
      </div>

      <button
        onClick={() => setOpeningsOpen(!openingsOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground"
      >
        <span>Aberturas ({item.aberturas.length})</span>
        {openingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {openingsOpen && (
        <OpeningsList
          item={item}
          onUpdate={(aberturas) => onUpdate({ aberturas })}
        />
      )}
    </div>
  );
}

function OpeningsList({ item, onUpdate }: { item: WallItem; onUpdate: (a: Opening[]) => void }) {
  const add = () => onUpdate([...item.aberturas, { largura: 0.8, altura: 2.1 }]);
  const update = (i: number, patch: Partial<Opening>) =>
    onUpdate(item.aberturas.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  const remove = (i: number) => onUpdate(item.aberturas.filter((_, idx) => idx !== i));

  const areaTotal = wallAreaBruta(item);
  const areaAb = wallAreaAberturas(item);
  const overflow = areaAb > areaTotal && areaTotal > 0;

  return (
    <div className="space-y-2 rounded-lg bg-surface/50 p-3">
      {item.aberturas.map((a, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <div>
            <label className="text-[10px] font-medium uppercase text-muted-foreground">Largura</label>
            <NumInput value={a.largura || ""} onChange={(n) => update(i, { largura: n })} max={10} />
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase text-muted-foreground">Altura</label>
            <NumInput value={a.altura || ""} onChange={(n) => update(i, { altura: n })} max={10} />
          </div>
          <button onClick={() => remove(i)} className="h-14 rounded-lg bg-destructive/10 px-3 text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {overflow && (
        <div className="rounded-lg bg-destructive/15 px-3 py-2 text-xs font-medium text-destructive">
          ⚠ Aberturas maiores que a parede
        </div>
      )}
      <button
        onClick={add}
        className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-sm font-semibold text-primary"
      >
        <Plus className="h-4 w-4" /> Adicionar abertura
      </button>
    </div>
  );
}

function CeilingEditor({ item, onUpdate }: { item: CeilingItem; onUpdate: (p: Partial<Item>) => void }) {
  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Comprimento (m)</label>
          <NumInput value={item.comprimento || ""} onChange={(n) => onUpdate({ comprimento: n })} max={100} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Largura (m)</label>
          <NumInput value={item.largura || ""} onChange={(n) => onUpdate({ largura: n })} max={100} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Altura laje (m)</label>
          <NumInput value={item.altura_laje || ""} onChange={(n) => onUpdate({ altura_laje: n })} max={15} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Altura forro (m)</label>
          <NumInput value={item.altura_forro || ""} onChange={(n) => onUpdate({ altura_forro: n })} max={15} />
        </div>
      </div>
    </div>
  );
}

function CalcMemory({ item }: { item: Item }) {
  if (item.tipo === "forro") {
    const c = item as CeilingItem;
    const area = ceilingArea(c);
    const queda = Math.max(0, c.altura_laje - c.altura_forro);
    return (
      <div className="mt-2 space-y-1 rounded-lg bg-surface/50 p-3 text-xs text-muted-foreground">
        <div>Área = {fmt(c.comprimento)} × {fmt(c.largura)} = <b className="text-foreground">{fmt(area)} m²</b></div>
        <div>Queda = {fmt(c.altura_laje)} − {fmt(c.altura_forro)} = <b className="text-foreground">{fmt(queda)} m</b></div>
        <div>Perímetro = {fmt(2 * (c.comprimento + c.largura))} m</div>
      </div>
    );
  }
  const w = item as WallItem;
  const bruta = wallAreaBruta(w);
  const ab = wallAreaAberturas(w);
  const liq = wallAreaLiquida(w);
  return (
    <div className="mt-2 space-y-1 rounded-lg bg-surface/50 p-3 text-xs text-muted-foreground">
      <div>Área bruta = {fmt(w.comprimento)} × {fmt(w.altura)} = <b className="text-foreground">{fmt(bruta)} m²</b></div>
      <div>Aberturas = {fmt(ab)} m² ({w.aberturas.length})</div>
      <div>Área líquida = <b className="text-foreground">{fmt(liq)} m²</b></div>
    </div>
  );
}
