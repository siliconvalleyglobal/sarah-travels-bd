"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/components/LanguageProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
    >
      <LanguageProvider>
        {children}
        <Toaster richColors position="top-right" />
      </LanguageProvider>
    </ThemeProvider>
  );
}
