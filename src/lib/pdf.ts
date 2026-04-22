import jsPDF from "jspdf";
import type { Totals } from "./calc";

type CompanyInfo = {
  name: string;
  phone: string;
  email: string;
  notes: string;
  logo_url: string | null;
};

type QuoteData = {
  cliente: string;
  obra: string;
  totals: Totals;
  valorFinal: number;
  lines: Array<{ nome: string; quantidade: number; unidade: string; total: number }>;
};

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function loadImageAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateQuotePDF(company: CompanyInfo, quote: QuoteData): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 18;
  let y = 18;

  // Logo
  if (company.logo_url) {
    const dataUrl = await loadImageAsDataURL(company.logo_url);
    if (dataUrl) {
      try {
        doc.addImage(dataUrl, "PNG", margin, y, 28, 28);
      } catch {/* ignore bad image */}
    }
  }

  // Empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(20, 20, 20);
  doc.text(company.name || "Sua Empresa", margin + 34, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  if (company.phone) doc.text(`Tel: ${company.phone}`, margin + 34, y + 16);
  if (company.email) doc.text(company.email, margin + 34, y + 22);

  y += 38;

  // Linha divisória
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text("PROPOSTA COMERCIAL", margin, y);
  y += 8;

  // Cliente
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const today = new Date().toLocaleDateString("pt-BR");
  doc.text(`Cliente: ${quote.cliente || "—"}`, margin, y);
  doc.text(`Data: ${today}`, pageW - margin, y, { align: "right" });
  y += 6;
  if (quote.obra) {
    doc.text(`Obra: ${quote.obra}`, margin, y);
    y += 6;
  }
  y += 6;

  // Serviço
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Serviço", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);

  const lines: string[] = [];
  if (quote.totals.area_parede > 0)
    lines.push(`• ${quote.totals.area_parede.toFixed(2)} m² de Parede em drywall`);
  if (quote.totals.area_contraparede > 0)
    lines.push(`• ${quote.totals.area_contraparede.toFixed(2)} m² de Contraparede em drywall`);
  if (quote.totals.area_forro > 0)
    lines.push(`• ${quote.totals.area_forro.toFixed(2)} m² de Forro em drywall`);
  if (lines.length === 0) lines.push("• Serviço a definir");

  for (const line of lines) {
    doc.text(line, margin, y);
    y += 6;
  }

  // Tabela de materiais
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Materiais inclusos", margin, y);
  y += 7;

  const colNome = margin;
  const colQtd = 130;
  const colTotal = pageW - margin;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("Material", colNome, y);
  doc.text("Qtd", colQtd, y);
  doc.text("Total", colTotal, y, { align: "right" });
  y += 5;

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  quote.lines.forEach((l, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin - 1, y - 3, pageW - margin * 2 + 2, 7, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(l.nome, colNome, y);
    doc.text(`${l.quantidade} ${l.unidade}`, colQtd, y);
    doc.text(brl(l.total), colTotal, y, { align: "right" });
    y += 7;
  });

  y += 6;

  // Valor total
  doc.setFillColor(245, 158, 11); // laranja
  doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(60, 30, 0);
  doc.text("VALOR TOTAL DO SERVIÇO", margin + 6, y + 9);
  doc.setFontSize(20);
  doc.setTextColor(30, 15, 0);
  doc.text(brl(quote.valorFinal), pageW - margin - 6, y + 17, { align: "right" });

  y += 36;

  // Observações
  if (company.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("Observações", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const split = doc.splitTextToSize(company.notes, pageW - margin * 2);
    doc.text(split, margin, y);
  }

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Proposta gerada com Drywall Pro", pageW / 2, 285, { align: "center" });

  return doc.output("blob");
}

export function pdfFileName(cliente: string) {
  const safe = (cliente || "cliente").replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 40);
  const date = new Date().toISOString().slice(0, 10);
  return `Orcamento_${safe}_${date}.pdf`;
}
