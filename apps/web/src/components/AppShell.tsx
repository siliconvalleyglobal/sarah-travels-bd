"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface AppShellProps {
  children: React.ReactNode;
  showFooter?: boolean;
  lang?: "en" | "bn";
  onLangToggle?: () => void;
}

export function AppShell({ children, showFooter = true, lang: controlledLang, onLangToggle: controlledToggle }: AppShellProps) {
  const [internalLang, setInternalLang] = useState<"en" | "bn">("en");
  const lang = controlledLang ?? internalLang;
  const onLangToggle = controlledToggle ?? (() => setInternalLang((l) => (l === "en" ? "bn" : "en")));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader lang={lang} onLangToggle={onLangToggle} />
      <main className="flex-1">{children}</main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
