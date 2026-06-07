"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/components/LanguageProvider";

interface AppShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function AppShell({ children, showFooter = true }: AppShellProps) {
  const { lang, toggleLang } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader lang={lang} onLangToggle={toggleLang} />
      <main className="flex-1">{children}</main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
