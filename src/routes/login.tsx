import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Entrar — Drywall Pro" }] }),
});

const emailSchema = z.string().trim().email("Email inválido").max(255);
const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Digite sua senha").max(128),
});
const newPasswordSchema = z.string().min(8, "Mínimo 8 caracteres").max(128);

const inputClass =
  "h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base text-foreground focus:border-primary focus:outline-none";
const buttonClass =
  "touch-target mt-4 w-full rounded-xl bg-gradient-primary text-base font-bold text-primary-foreground shadow-glow transition-transform active:scale-[0.98] disabled:opacity-50";

function describeAuthError(error: AuthError): string {
  const msg = error.message.toLowerCase();
  if (error.code === "email_not_confirmed" || msg.includes("not confirmed")) {
    return "Seu email ainda não foi confirmado. Abra o link que enviamos ou toque em “Reenviar confirmação”.";
  }
  if (error.code === "invalid_credentials" || msg.includes("invalid login")) {
    return "Email ou senha incorretos";
  }
  if (error.status === 429 || msg.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  }
  if (error.status === 0 || error.name === "AuthRetryableFetchError" || msg.includes("fetch")) {
    return "Sem conexão com o servidor. Verifique sua internet e tente de novo.";
  }
  return "Não foi possível entrar: " + error.message;
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Link de "esqueci a senha" volta para /login com sessão de recuperação.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setRecovering(true);
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password,
    });
    setLoading(false);
    if (error) {
      setNeedsConfirmation(
        error.code === "email_not_confirmed" || /not confirmed/i.test(error.message),
      );
      toast.error(describeAuthError(error), { duration: 8000 });
      return;
    }
    navigate({ to: "/" });
  };

  const onResendConfirmation = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Digite seu email primeiro");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: parsed.data,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(describeAuthError(error));
      return;
    }
    toast.success("Email de confirmação reenviado. Verifique também o spam.");
  };

  const onForgotPassword = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Digite seu email no campo acima e toque de novo em “Esqueci a senha”");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) {
      toast.error(describeAuthError(error));
      return;
    }
    toast.success("Se o email estiver cadastrado, você receberá um link para criar nova senha.", {
      duration: 8000,
    });
  };

  const onSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newPasswordSchema.safeParse(newPassword);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setLoading(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("password")
          ? "Senha fraca ou já vazada — escolha outra mais forte"
          : describeAuthError(error),
      );
      return;
    }
    toast.success("Senha alterada!");
    navigate({ to: "/" });
  };

  if (recovering) {
    return (
      <div className="flex min-h-screen flex-col px-6 pt-16 pb-8">
        <div className="mb-12 flex justify-center">
          <Logo size={56} />
        </div>
        <h1 className="mb-2 text-3xl font-black text-foreground">Nova senha</h1>
        <p className="mb-8 text-muted-foreground">Escolha uma nova senha para sua conta.</p>
        <form onSubmit={onSetNewPassword} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Nova senha</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
          </div>
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pt-16 pb-8">
      <div className="mb-12 flex justify-center">
        <Logo size={56} />
      </div>
      <h1 className="mb-2 text-3xl font-black text-foreground">Entrar</h1>
      <p className="mb-8 text-muted-foreground">Acesse seus orçamentos e configurações.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
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
            className={inputClass}
            required
          />
        </div>
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-3 text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={loading}
          className="font-semibold text-primary disabled:opacity-50"
        >
          Esqueci a senha
        </button>
        {needsConfirmation && (
          <button
            type="button"
            onClick={onResendConfirmation}
            disabled={loading}
            className="font-semibold text-primary disabled:opacity-50"
          >
            Reenviar confirmação
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-primary">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
