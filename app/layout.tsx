import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Space_Mono, Oswald } from "next/font/google"
import { Providers } from "@/components/providers"
import { AppShell } from "@/components/app-shell"
import { CalculatorWidget } from "@/components/calculator-widget"
import { Analytics } from "@vercel/analytics/next"
import { themePresets } from "@/lib/theme-presets"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

// Vintage Ledger — números/rótulos em monospace tabular (estilo livro-razão)
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

// Vintage Ledger — títulos em grotesca condensada (masthead de almanaque)
// latin-ext garante os acentos do português (Ç, Õ, Ã…)
const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  variable: "--font-oswald",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Valore",
  description: "Controle para seu portfólio de investimentos e finanças pessoais",
  applicationName: "Valore",
  generator: "Next.js",
  keywords: ["investimentos", "finanças", "portfólio", "controle financeiro"],
  authors: [{ name: "Valore" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Valore",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Presets serializados a partir da fonte única (lib/theme-presets.ts) e injetados
  // no script anti-flash abaixo. Cobre TODOS os temas — sem isso, temas fora da lista
  // hardcoded provocavam flash do tema padrão no carregamento. `mode` é normalizado
  // ("light" explícito, todo o resto "dark") para casar com a convenção do app.
  const themeBoot = JSON.stringify(
    themePresets.map((t) => ({
      id: t.id,
      colors: t.colors,
      mode: t.mode === "light" ? "light" : "dark",
    }))
  )

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const CACHE_VERSION = '${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "1"}';
                  const fp = localStorage.getItem('valore_fast_path_cache');
                  let tid = 'paper';

                  if (fp) {
                    const cached = JSON.parse(fp);
                    if (cached.version === CACHE_VERSION) {
                      tid = cached.themeId || 'paper';
                    } else {
                      localStorage.removeItem('valore_fast_path_cache');
                    }
                  } else {
                    const s = localStorage.getItem('valore_app_data_v2');
                    tid = s ? JSON.parse(s).settings?.themeId || 'paper' : 'paper';
                  }

                  const pts = ${themeBoot};
                  const t = pts.find(x => x.id === tid) || pts[0];
                  const r = document.documentElement;
                  Object.entries(t.colors).forEach(([k, v]) => {
                    r.style.setProperty('--theme-' + k.replace(/([A-Z])/g, '-$1').toLowerCase(), v);
                  });
                  if (t.mode === 'dark') r.classList.add('dark'); else r.classList.remove('dark');
                  const mt = document.querySelector('meta[name="theme-color"]');
                  if (mt) { const rgb = t.colors.background.split(' '); mt.setAttribute('content', 'rgb(' + rgb.join(',') + ')'); }
                  // Largura da sidebar (anti-flash): respeita o colapso salvo.
                  if (localStorage.getItem('valore_sidebar_collapsed') === '1') r.style.setProperty('--sidebar-w', '5rem');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${spaceMono.variable} ${oswald.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
          <CalculatorWidget />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
