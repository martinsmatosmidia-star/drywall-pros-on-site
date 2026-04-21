import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item } from "@/lib/calc";

type DraftState = {
  cliente: string;
  obra: string;
  alturaPadrao: number;
  comprimentoPadrao: number;
  items: Item[];
  setCliente: (v: string) => void;
  setObra: (v: string) => void;
  setAlturaPadrao: (v: number) => void;
  setComprimentoPadrao: (v: number) => void;
  addItem: (i: Item) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;
  reset: () => void;
  loadFromQuote: (cliente: string, obra: string, items: Item[]) => void;
};

export const useDraft = create<DraftState>()(
  persist(
    (set) => ({
      cliente: "",
      obra: "",
      alturaPadrao: 2.7,
      comprimentoPadrao: 0,
      items: [],
      setCliente: (v) => set({ cliente: v }),
      setObra: (v) => set({ obra: v }),
      setAlturaPadrao: (v) => set({ alturaPadrao: v }),
      setComprimentoPadrao: (v) => set({ comprimentoPadrao: v }),
      addItem: (i) => set((s) => ({ items: [...s.items, i] })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? ({ ...it, ...patch } as Item) : it)),
        })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      reset: () => set({ cliente: "", obra: "", items: [], comprimentoPadrao: 0 }),
      loadFromQuote: (cliente, obra, items) => set({ cliente, obra, items }),
    }),
    { name: "drywallpro-draft" }
  )
);
