import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('valore-app-data-v1');
                  const themeId = saved ? JSON.parse(saved).settings?.themeId || 'paper' : 'paper';
                  const themePresets = [
                    { id: 'paper', colors: { background: '250 247 240', card: '255 252 248', border: '220 210 195', primary: '124 73 20', accent: '180 100 40', muted: '238 228 215', mutedForeground: '130 110 85', success: '76 140 74', successForeground: '255 255 255', warning: '190 120 30', danger: '185 50 50' }, mode: 'light' },
                    { id: 'midnight', colors: { background: '15 23 42', card: '30 41 59', border: '51 65 85', primary: '52 211 153', accent: '34 211 238', muted: '71 85 105', mutedForeground: '160 174 192', success: '52 211 153', successForeground: '15 23 42', warning: '251 191 36', danger: '248 113 113' }, mode: 'dark' }
                  ];
                  const theme = themePresets.find(t => t.id === themeId) || themePresets[0];
                  const root = document.documentElement;
                  Object.entries(theme.colors).forEach(([key, value]) => {
                    const cssVarName = '--theme-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
                    root.style.setProperty(cssVarName, value);
                  });
                  if (theme.mode === 'dark') root.classList.add('dark');
                  else root.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}
