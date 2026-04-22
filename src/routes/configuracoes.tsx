import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { useCompanySettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/configuracoes")({
  component: () => (<AuthGuard><Configuracoes /></AuthGuard>),
  head: () => ({ meta: [{ title: "Configurações — Drywall Pro" }] }),
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-primary">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Configuracoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { company, update: updateCompany, reload: reloadCompany } = useCompanySettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfileName(data?.name ?? "");
        setProfileLoaded(true);
      });
  }, [user?.id]);

  const saveProfileName = async (name: string) => {
    setProfileName(name);
    if (!user) return;
    await supabase.from("profiles").update({ name }).eq("id", user.id);
  };

  if (!company || !profileLoaded) {
    return <div className="px-4 pt-10 text-center text-muted-foreground">Carregando...</div>;
  }

  const uploadLogo = async (f: File) => {
    if (!user) return;
    setUploading(true);
    const ext = f.name.split(".").pop() || "png";
    const path = `${user.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, f, { upsert: true });
    if (error) {
      toast.error("Erro ao subir logo: " + error.message);
      setUploading(false);
      return;
    }
    const { data: signed } = await supabase.storage.from("logos").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signed?.signedUrl) {
      await updateCompany({ logo_url: signed.signedUrl });
      reloadCompany();
      toast.success("Logo atualizada");
    }
    setUploading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-4 px-4 pt-6">
      <h1 className="text-2xl font-black text-foreground">Configurações</h1>

      <Section title="Conta">
        <Field label="Nome">
          <input
            type="text"
            value={profileName}
            onChange={(e) => saveProfileName(e.target.value)}
            maxLength={100}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus:border-primary focus:outline-none"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={user?.email ?? ""}
            readOnly
            className="h-12 w-full rounded-xl border-2 border-border bg-surface/50 px-3 text-muted-foreground"
          />
        </Field>
      </Section>

      <Section title="Dados da empresa">
        <Field label="Nome da empresa">
          <input
            type="text"
            value={company.name}
            onChange={(e) => updateCompany({ name: e.target.value })}
            maxLength={100}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus:border-primary focus:outline-none"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Telefone">
            <input
              type="tel"
              value={company.phone}
              onChange={(e) => updateCompany({ phone: e.target.value })}
              maxLength={30}
              className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus:border-primary focus:outline-none"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={company.email}
              onChange={(e) => updateCompany({ email: e.target.value })}
              maxLength={100}
              className="h-12 w-full rounded-xl border-2 border-border bg-surface px-3 text-foreground focus:border-primary focus:outline-none"
            />
          </Field>
        </div>
        <Field label="Observações para o orçamento">
          <textarea
            value={company.notes}
            onChange={(e) => updateCompany({ notes: e.target.value })}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
        </Field>
        <Field label="Logo (PNG/JPG)">
          <div className="flex items-center gap-3">
            {company.logo_url && (
              <img src={company.logo_url} alt="Logo" className="h-16 w-16 rounded-lg border border-border bg-white object-contain" />
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="touch-target flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-3 text-sm font-semibold text-foreground"
              disabled={uploading}
            >
              <Upload className="h-4 w-4" /> {uploading ? "Subindo..." : "Enviar logo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadLogo(f);
              }}
            />
          </div>
        </Field>
      </Section>

      <button
        onClick={logout}
        className="touch-target flex w-full items-center justify-center gap-2 rounded-xl border-2 border-destructive/30 bg-destructive/10 text-sm font-bold text-destructive"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>

      <div className="rounded-2xl border-2 border-success/30 bg-success/5 p-4">
        <h3 className="text-sm font-black uppercase tracking-wide text-success">Precisa de ajuda?</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Fale com nosso suporte direto pelo WhatsApp. Respondemos em minutos.
        </p>
        <a
          href="https://wa.me/5548991461241?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Drywall%20Pro"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-bold text-success-foreground"
        >
          💬 Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
