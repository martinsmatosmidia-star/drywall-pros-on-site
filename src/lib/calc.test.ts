import { describe, it, expect } from "vitest";
import {
  computeTotals,
  wallAreaLiquida,
  montantesParede,
  guiasExtraAberturas,
  forroF530,
  forroArameKg,
  type Item,
  type CalcParams,
} from "./calc";

const params: CalcParams = {
  espacamento: 0.6,
  perda_pct: 7,
  parafusos_por_placa: 30,
  massa_m2_balde: 23,
  fita_tipo: "papel",
};

describe("Cálculos de parede", () => {
  it("área líquida desconta aberturas", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 5,
      altura: 3,
      aberturas: [{ largura: 1, altura: 2, tipo: "porta" as const }],
    };
    expect(wallAreaLiquida(w)).toBe(13); // 15 - 2
  });

  it("área líquida nunca negativa", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 1,
      altura: 1,
      aberturas: [{ largura: 5, altura: 5, tipo: "porta" as const }],
    };
    expect(wallAreaLiquida(w)).toBe(0);
  });

  it("montantes base com altura ≤ 3", () => {
    const w = { id: "1", tipo: "parede" as const, comprimento: 6, altura: 3, aberturas: [] };
    // ceil(6/0.6)+1 = 11
    expect(montantesParede(w, 0.6)).toBe(11);
  });

  it("montantes com altura > 3 adiciona extras", () => {
    const w = { id: "1", tipo: "parede" as const, comprimento: 6, altura: 4, aberturas: [] };
    // base=11, extra = (11*(4-3+0.3))/3 = 11*1.3/3 = 4.766..., ceil=5 → 16
    expect(montantesParede(w, 0.6)).toBe(16);
  });

  it("montantes adiciona +1 por abertura", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 6,
      altura: 3,
      aberturas: [
        { largura: 1, altura: 2, tipo: "porta" as const },
        { largura: 0.8, altura: 2.1, tipo: "janela" as const },
      ],
    };
    // base = 11, +2 (uma por abertura)
    expect(montantesParede(w, 0.6)).toBe(13);
  });
});

describe("Guias extras por abertura", () => {
  it("porta 0,9 m: ⌈0,9/3⌉ = 1 guia", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 5,
      altura: 3,
      aberturas: [{ largura: 0.9, altura: 2.1, tipo: "porta" as const }],
    };
    expect(guiasExtraAberturas(w)).toBe(1);
  });

  it("vão 2 m: ⌈2/3⌉ = 1 guia", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 5,
      altura: 3,
      aberturas: [{ largura: 2, altura: 2.1, tipo: "vao" as const }],
    };
    expect(guiasExtraAberturas(w)).toBe(1);
  });

  it("janela 1,5 m: verga + peitoril = 3 m → 1 guia", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 5,
      altura: 3,
      aberturas: [{ largura: 1.5, altura: 1.2, tipo: "janela" as const }],
    };
    expect(guiasExtraAberturas(w)).toBe(1);
  });

  it("janela 4 m: ⌈8/3⌉ = 3 guias", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 6,
      altura: 3,
      aberturas: [{ largura: 4, altura: 1.2, tipo: "janela" as const }],
    };
    expect(guiasExtraAberturas(w)).toBe(3);
  });

  it("2 portas pequenas: 1 + 1 = 2 guias", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 6,
      altura: 3,
      aberturas: [
        { largura: 0.8, altura: 2.1, tipo: "porta" as const },
        { largura: 0.9, altura: 2.1, tipo: "porta" as const },
      ],
    };
    expect(guiasExtraAberturas(w)).toBe(2);
  });

  it("abertura sem tipo é tratada como porta", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: 5,
      altura: 3,
      aberturas: [{ largura: 0.9, altura: 2.1 }],
    };
    expect(guiasExtraAberturas(w)).toBe(1);
  });
});

describe("Cálculos de forro", () => {
  it("F530: linhas × comprimento ÷3 ceil", () => {
    const c = {
      id: "1",
      tipo: "forro" as const,
      comprimento: 5,
      largura: 4,
      altura_laje: 3,
      altura_forro: 2.7,
    };
    // linhas = ceil(4/0.6)+1 = 8; total = 8*5=40; /3 = 13.33 → 14
    expect(forroF530(c, 0.6)).toBe(14);
  });

  it("arame com queda zero usa apenas 0.05m", () => {
    const c = {
      id: "1",
      tipo: "forro" as const,
      comprimento: 5,
      largura: 4,
      altura_laje: 2.7,
      altura_forro: 2.7,
    };
    // F530=14 → reguladores=56 → metros = 56*0.05 = 2.8 → ceil(2.8/14) = 1
    expect(forroArameKg(c, 0.6)).toBe(1);
  });
});

describe("Totais agregados", () => {
  const items: Item[] = [
    { id: "p1", tipo: "parede", comprimento: 5, altura: 3, aberturas: [] },
    {
      id: "p2",
      tipo: "parede",
      comprimento: 4,
      altura: 3,
      aberturas: [{ largura: 0.9, altura: 2.1, tipo: "porta" }],
    },
    { id: "c1", tipo: "contraparede", comprimento: 3, altura: 3, aberturas: [] },
    {
      id: "f1",
      tipo: "forro",
      comprimento: 3,
      largura: 3,
      altura_laje: 2.8,
      altura_forro: 2.6,
    },
  ];

  const t = computeTotals(items, params);

  it("área parede soma corretamente", () => {
    // 15 + (12 - 1.89) = 25.11
    expect(t.area_parede).toBeCloseTo(25.11, 2);
  });
  it("área contraparede", () => {
    expect(t.area_contraparede).toBe(9);
  });
  it("área forro", () => {
    expect(t.area_forro).toBe(9);
  });
  it("placas parede ×2 / 2.16", () => {
    expect(t.placas_parede).toBe(Math.ceil((25.11 * 2) / 2.16));
  });
  it("placas contraparede ×1 / 2.16", () => {
    expect(t.placas_contraparede).toBe(Math.ceil(9 / 2.16));
  });
  it("placas forro ×1 / 2.16", () => {
    expect(t.placas_forro).toBe(Math.ceil(9 / 2.16));
  });
  it("placas final aplica perda", () => {
    const tot = t.placas_parede + t.placas_contraparede + t.placas_forro;
    expect(t.placas_final).toBe(Math.ceil(tot * 1.07));
  });
  it("parafusos múltiplo de 500", () => {
    expect(t.parafusos % 500).toBe(0);
    expect(t.parafusos).toBeGreaterThanOrEqual(t.placas_final * 30);
  });
  it("buchas no mínimo 100", () => {
    expect(t.buchas).toBeGreaterThanOrEqual(100);
  });
  it("fita papel divide por 150", () => {
    expect(t.fita_rolos).toBe(Math.ceil(t.area_total / 150));
  });
});

describe("Bordas e segurança", () => {
  it("não aceita valores negativos", () => {
    const w = {
      id: "1",
      tipo: "parede" as const,
      comprimento: -5,
      altura: -3,
      aberturas: [],
    };
    expect(wallAreaLiquida(w)).toBe(0);
  });

  it("itens vazios retornam zeros", () => {
    const t = computeTotals([], params);
    expect(t.area_total).toBe(0);
    expect(t.placas_final).toBe(0);
    expect(t.buchas).toBe(100); // mínimo
  });

  it("fita tela usa 90m", () => {
    const items: Item[] = [
      { id: "p1", tipo: "parede", comprimento: 10, altura: 3, aberturas: [] },
    ];
    const t = computeTotals(items, { ...params, fita_tipo: "tela" });
    expect(t.fita_rolos).toBe(Math.ceil(30 / 90));
  });
});
