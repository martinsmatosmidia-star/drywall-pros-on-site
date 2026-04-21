/**
 * Drywall Pro — Engine de cálculo
 * Todas as fórmulas seguem o brief (arredondamento sempre para cima, sem negativos).
 */

export const PLACA_AREA = 2.16; // m² por placa
export const FITA_PAPEL_M = 150;
export const FITA_TELA_M = 90;
export const PARAFUSOS_POR_PLACA_DEFAULT = 30;
export const MASSA_M2_BALDE_DEFAULT = 23;
export const ESPACAMENTO_DEFAULT = 0.6;
export const PERDA_DEFAULT = 0.07;

export type Opening = { largura: number; altura: number };
export type WallItem = {
  id: string;
  tipo: "parede" | "contraparede";
  comprimento: number;
  altura: number;
  aberturas: Opening[];
};
export type CeilingItem = {
  id: string;
  tipo: "forro";
  comprimento: number;
  largura: number;
  altura_laje: number;
  altura_forro: number;
};
export type Item = WallItem | CeilingItem;

export type CalcParams = {
  espacamento: number; // 0.60 ou 0.40
  perda_pct: number; // %
  parafusos_por_placa: number;
  massa_m2_balde: number;
  fita_tipo: "papel" | "tela";
};

const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

// --- Áreas
export function wallAreaBruta(w: WallItem) {
  return safe(w.comprimento) * safe(w.altura);
}
export function wallAreaAberturas(w: WallItem) {
  return w.aberturas.reduce((acc, a) => acc + safe(a.largura) * safe(a.altura), 0);
}
export function wallAreaLiquida(w: WallItem) {
  return Math.max(0, wallAreaBruta(w) - wallAreaAberturas(w));
}
export function ceilingArea(c: CeilingItem) {
  return safe(c.comprimento) * safe(c.largura);
}

// --- Montantes para uma parede
export function montantesParede(w: WallItem, espacamento: number): number {
  const esp = espacamento > 0 ? espacamento : ESPACAMENTO_DEFAULT;
  const c = safe(w.comprimento);
  const h = safe(w.altura);
  const base = Math.ceil(c / esp) + 1;
  let total = base;
  if (h > 3) {
    const extra = (base * (h - 3 + 0.3)) / 3;
    total = base + Math.ceil(extra);
  }
  // +2 por abertura
  total += w.aberturas.length * 2;
  return total;
}

// --- Guias extras por abertura (segundo brief)
export function guiasExtraAberturas(w: WallItem): number {
  return w.aberturas.reduce((acc, a) => {
    const guia_extra = safe(a.largura) * 2;
    const base = Math.ceil(guia_extra / 3);
    return acc + base + 1;
  }, 0);
}

// --- Forro: perímetro, tabica, F530, regulador, arame
export function forroPerimetro(c: CeilingItem) {
  return safe(c.comprimento) * 2 + safe(c.largura) * 2;
}
export function forroTabica(c: CeilingItem) {
  return Math.ceil(forroPerimetro(c) / 3);
}
export function forroF530(c: CeilingItem, espacamento: number): number {
  const esp = espacamento > 0 ? espacamento : ESPACAMENTO_DEFAULT;
  const linhas = Math.ceil(safe(c.largura) / esp) + 1;
  const total_metros = linhas * safe(c.comprimento);
  return Math.ceil(total_metros / 3);
}
export function forroReguladores(c: CeilingItem, espacamento: number): number {
  return forroF530(c, espacamento) * 4;
}
export function forroArameKg(c: CeilingItem, espacamento: number): number {
  const queda = Math.max(0, safe(c.altura_laje) - safe(c.altura_forro));
  const compArame = queda + 0.05;
  const total_metros = forroReguladores(c, espacamento) * compArame;
  return Math.ceil(total_metros / 14);
}

// --- Totais agregados
export type Totals = {
  area_parede: number;
  area_contraparede: number;
  area_forro: number;
  area_total: number;
  linear_total: number; // soma de comprimentos das paredes/contraparedes
  placas_parede: number;
  placas_contraparede: number;
  placas_forro: number;
  placas_total: number;
  placas_final: number;
  montantes: number;
  guias: number;
  parafusos: number;
  buchas: number;
  massa_baldes: number;
  fita_rolos: number;
  forro_tabica: number;
  forro_f530: number;
  forro_reguladores: number;
  forro_arame_kg: number;
};

export function computeTotals(items: Item[], p: CalcParams): Totals {
  const walls = items.filter((i): i is WallItem => i.tipo === "parede");
  const contras = items.filter((i): i is WallItem => i.tipo === "contraparede");
  const ceilings = items.filter((i): i is CeilingItem => i.tipo === "forro");

  const area_parede = walls.reduce((a, w) => a + wallAreaLiquida(w), 0);
  const area_contraparede = contras.reduce((a, w) => a + wallAreaLiquida(w), 0);
  const area_forro = ceilings.reduce((a, c) => a + ceilingArea(c), 0);
  const area_total = area_parede + area_contraparede + area_forro;
  const linear_total =
    walls.reduce((a, w) => a + safe(w.comprimento), 0) +
    contras.reduce((a, w) => a + safe(w.comprimento), 0);

  // Placas
  const placas_parede = Math.ceil((area_parede * 2) / PLACA_AREA);
  const placas_contraparede = Math.ceil(area_contraparede / PLACA_AREA);
  const placas_forro = Math.ceil(area_forro / PLACA_AREA);
  const placas_total = placas_parede + placas_contraparede + placas_forro;
  const perda = Math.max(0, p.perda_pct) / 100;
  const placas_final = Math.ceil(placas_total * (1 + perda));

  // Montantes (paredes + contraparedes)
  const montantes =
    walls.reduce((a, w) => a + montantesParede(w, p.espacamento), 0) +
    contras.reduce((a, w) => a + montantesParede(w, p.espacamento), 0);

  // Guias: lineares×2 ÷3 + extras de aberturas
  const guias_base = Math.ceil((linear_total * 2) / 3);
  const guias_extra =
    walls.reduce((a, w) => a + guiasExtraAberturas(w), 0) +
    contras.reduce((a, w) => a + guiasExtraAberturas(w), 0);
  const guias = guias_base + guias_extra;

  // Parafusos: placas × 30, arredondar para múltiplo de 500
  const paraf_qtd = placas_final * (p.parafusos_por_placa || PARAFUSOS_POR_PLACA_DEFAULT);
  const parafusos = Math.ceil(paraf_qtd / 500) * 500;

  // Buchas
  const buchas = Math.max(100, guias * 5);

  // Massa
  const massa_baldes = Math.ceil(area_total / (p.massa_m2_balde || MASSA_M2_BALDE_DEFAULT));

  // Fita exclusiva
  const necessidade = area_total;
  const fita_rolos =
    p.fita_tipo === "tela"
      ? Math.ceil(necessidade / FITA_TELA_M)
      : Math.ceil(necessidade / FITA_PAPEL_M);

  // Forro
  const forro_tabica = ceilings.reduce((a, c) => a + forroTabica(c), 0);
  const forro_f530 = ceilings.reduce((a, c) => a + forroF530(c, p.espacamento), 0);
  const forro_reguladores = ceilings.reduce(
    (a, c) => a + forroReguladores(c, p.espacamento),
    0
  );
  const forro_arame_kg = ceilings.reduce((a, c) => a + forroArameKg(c, p.espacamento), 0);

  return {
    area_parede,
    area_contraparede,
    area_forro,
    area_total,
    linear_total,
    placas_parede,
    placas_contraparede,
    placas_forro,
    placas_total,
    placas_final,
    montantes,
    guias,
    parafusos,
    buchas,
    massa_baldes,
    fita_rolos,
    forro_tabica,
    forro_f530,
    forro_reguladores,
    forro_arame_kg,
  };
}

// --- Materiais (linhas para a aba Materiais) ---
export type MaterialLine = {
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  total: number;
};

export type PriceTable = {
  placa: number; // preço selecionado (placa_tipo)
  montante: number;
  guia: number;
  parafuso: number;
  massa: number;
  fita: number;
  bucha: number;
  tabica: number;
  f530: number;
  regulador: number;
  arame: number;
};

export function buildMateriais(
  totals: Totals,
  prices: PriceTable,
  fita_tipo: "papel" | "tela"
): MaterialLine[] {
  const lines: MaterialLine[] = [
    { nome: "Placas de drywall", quantidade: totals.placas_final, unidade: "un", preco: prices.placa, total: totals.placas_final * prices.placa },
    { nome: "Montantes", quantidade: totals.montantes, unidade: "un", preco: prices.montante, total: totals.montantes * prices.montante },
    { nome: "Guias", quantidade: totals.guias, unidade: "un", preco: prices.guia, total: totals.guias * prices.guia },
    { nome: "Parafusos", quantidade: totals.parafusos, unidade: "un", preco: prices.parafuso, total: totals.parafusos * prices.parafuso },
    { nome: "Buchas", quantidade: totals.buchas, unidade: "un", preco: prices.bucha, total: totals.buchas * prices.bucha },
    { nome: "Massa (baldes)", quantidade: totals.massa_baldes, unidade: "balde", preco: prices.massa, total: totals.massa_baldes * prices.massa },
    { nome: `Fita ${fita_tipo === "tela" ? "tela (90m)" : "papel (150m)"}`, quantidade: totals.fita_rolos, unidade: "rolo", preco: prices.fita, total: totals.fita_rolos * prices.fita },
  ];
  if (totals.area_forro > 0) {
    lines.push(
      { nome: "Tabica/Cantoneira (3m)", quantidade: totals.forro_tabica, unidade: "un", preco: prices.tabica, total: totals.forro_tabica * prices.tabica },
      { nome: "Perfil F530 (3m)", quantidade: totals.forro_f530, unidade: "un", preco: prices.f530, total: totals.forro_f530 * prices.f530 },
      { nome: "Reguladores", quantidade: totals.forro_reguladores, unidade: "un", preco: prices.regulador, total: totals.forro_reguladores * prices.regulador },
      { nome: "Arame galvanizado", quantidade: totals.forro_arame_kg, unidade: "kg", preco: prices.arame, total: totals.forro_arame_kg * prices.arame }
    );
  }
  return lines;
}

export function placaPrecoFor(
  tipo: string,
  s: { placa_preco_st: number; placa_preco_ru: number; placa_preco_rf: number; placa_preco_perf_st: number; placa_preco_perf_ru: number }
): number {
  switch (tipo) {
    case "ST": return s.placa_preco_st;
    case "RU": return s.placa_preco_ru;
    case "RF": return s.placa_preco_rf;
    case "PERF_ST": return s.placa_preco_perf_st;
    case "PERF_RU": return s.placa_preco_perf_ru;
    default: return s.placa_preco_st;
  }
}
