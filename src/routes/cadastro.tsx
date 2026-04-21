import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
  head: () => ({ meta: [{ title: "Criar conta — Drywall Pro" }] }),
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
});

function CadastroPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ name, email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { name },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("password")) {
        toast.error("Senha fraca ou já vazada — escolha outra mais forte");
      } else if (error.message.toLowerCase().includes("registered")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error("Erro ao criar conta: " + error.message);
      }
      return;
    }
    toast.success("Conta criada!");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pt-16 pb-8">
      <div className="mb-12 flex justify-center"><Logo size={56} /></div>
      <h1 className="mb-2 text-3xl font-black text-foreground">Criar conta</h1>
      <p className="mb-8 text-muted-foreground">Comece a calcular orçamentos profissionais.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Nome</label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base text-foreground focus:border-primary focus:outline-none"
            required
          />
        </div>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base text-foreground focus:border-primary focus:outline-none"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Mínimo 8 caracteres. Senhas vazadas são bloqueadas.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="touch-target mt-4 w-full rounded-xl bg-gradient-primary text-base font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}
