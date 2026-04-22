import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Home, Package, FileText, Settings, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { Onboarding } from "@/components/Onboarding";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Drywall Pro" },
      { name: "description", content: "Drywall Pro Estimator calculates drywall materials, generates quotes, and exports commercial proposals." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Drywall Pro" },
      { property: "og:description", content: "Drywall Pro Estimator calculates drywall materials, generates quotes, and exports commercial proposals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Drywall Pro" },
      { name: "twitter:description", content: "Drywall Pro Estimator calculates drywall materials, generates quotes, and exports commercial proposals." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/LNmvafZWMMfsvtUFX6e6KsRueM83/social-images/social-1776803925879-ChatGPT_Image_21_de_abr._de_2026,_17_38_32.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/LNmvafZWMMfsvtUFX6e6KsRueM83/social-images/social-1776803925879-ChatGPT_Image_21_de_abr._de_2026,_17_38_32.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("onboarding_done");
    if (!done) setShowOnboarding(true);
  }, []);

  const finishOnboarding = () => {
    localStorage.setItem("onboarding_done", "true");
    setShowOnboarding(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showOnboarding && <Onboarding onFinish={finishOnboarding} />}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          <Link to="/" className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-semibold text-muted-foreground [&.active]:text-primary">
            <Home className="h-5 w-5" /> Início
          </Link>
          <Link to="/materiais" className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-semibold text-muted-foreground [&.active]:text-primary">
            <Package className="h-5 w-5" /> Materiais
          </Link>
          <Link to="/orcamento" className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-semibold text-muted-foreground [&.active]:text-primary">
            <FileText className="h-5 w-5" /> Orçamento
          </Link>
          <Link to="/opcoes" className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-semibold text-muted-foreground [&.active]:text-primary">
            <SlidersHorizontal className="h-5 w-5" /> Opções
          </Link>
          <Link to="/configuracoes" className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-semibold text-muted-foreground [&.active]:text-primary">
            <Settings className="h-5 w-5" /> Config
          </Link>
        </div>
      </nav>
    </div>
  );
}
