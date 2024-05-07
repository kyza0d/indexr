import "./globals.css";

import { ThemeProvider } from "@/components/theme/context"
import { SettingsProvider } from "@/components/settings/provider";
import Header from "@/components/header";

export const metadata = {
  title: "Pomodoro",
  description: "Pomodoro app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" >
      <body>
        <SettingsProvider>
          <Header />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main>{children}</main>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
