"use client";

import { SettingsProvider } from "@/components/settings/provider";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <SettingsProvider>{children}</SettingsProvider>
    </ThemeProvider>
  );
}
