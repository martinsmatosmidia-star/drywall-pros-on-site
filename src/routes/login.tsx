import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NumInput } from "@/components/NumInput";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Drywall Pro" }] }),
});

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Email ou senha incorretos");
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pt-16 pb-8">
      <div className="mb-12 flex justify-center"><Logo size={56} /></div>
      <h1 className="mb-2 text-3xl font-black text-foreground">Entrar</h1>
      <p className="mb-8 text-muted-foreground">Acesse seus orçamentos e configurações.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base text-foreground focus:border-primary focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Senha</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base text-foreground focus:border-primary focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="touch-target mt-4 w-full rounded-xl bg-gradient-primary text-base font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-primary">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

// Suprimir warning — NumInput é importado mas não usado aqui (reservado p/ futuro)
void NumInput;
