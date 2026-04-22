import { useState } from "react";
import { useCompanySettings } from "@/hooks/useSettings";

const steps = [
  {
    titulo: "Bem-vindo ao Drywall Pro! 👷",
    descricao:
      "O app que calcula materiais e gera orçamentos profissionais em segundos. Vamos configurar tudo em 2 passos rápidos.",
    botao: "Começar configuração",
    campo: undefined as undefined | "empresa",
  },
  {
    titulo: "Sua empresa",
    descricao:
      "Preencha os dados da sua empresa. Eles aparecerão no PDF do orçamento enviado ao cliente.",
    botao: "Próximo",
    campo: "empresa" as const,
  },
  {
    titulo: "Tudo pronto! ✅",
    descricao:
      "Seus preços padrão já estão configurados com valores de mercado. Você pode ajustá-los a qualquer momento em Opções.",
    botao: "Começar a usar",
    campo: undefined as undefined | "empresa",
  },
];

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const { company, update: updateCompany } = useCompanySettings();
  const [nome, setNome] = useState(company?.name || "");
  const [telefone, setTelefone] = useState(company?.phone || "");

  const next = async () => {
    if (steps[step].campo === "empresa") {
      await updateCompany({ name: nome, phone: telefone });
    }
    if (step < steps.length - 1) {
      setStep((v) => v + 1);
    } else {
      onFinish();
    }
  };

  const s = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-elevated sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <h2 className="text-xl font-black text-foreground">{s.titulo}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{s.descricao}</p>

        {s.campo === "empresa" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nome da empresa
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Drywall"
                maxLength={100}
                className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                WhatsApp
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={30}
                className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        <button
          onClick={next}
          className="mt-6 h-12 w-full rounded-xl bg-gradient-primary text-sm font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
        >
          {s.botao}
        </button>

        {step > 0 && (
          <button
            onClick={onFinish}
            className="mt-2 h-10 w-full rounded-xl text-xs font-semibold text-muted-foreground"
          >
            Pular e configurar depois
          </button>
        )}
      </div>
    </div>
  );
}
