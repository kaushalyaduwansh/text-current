"use client";

import { LanguageProvider } from "@/lib/language-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <Toaster position="top-center" richColors />
    </LanguageProvider>
  );
}
