import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
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
    // Splash screens para iPhone e iPad
    startupImage: [
      {
        url: "/icons/icon-512.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/icon-512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/icon-512.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/icon-512.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "maskable-icon", url: "/icons/maskable-512.png" },
    ],
  },
  formatDetection: {
    telephone: false,
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
                  const saved = localStorage.getItem('gabriel-sa-app-data');
                  if (saved) {
                    const data = JSON.parse(saved);
                    const themeId = data.settings?.themeId || 'paper';
                    const themePresets = [
                      { id: 'paper', colors: { background: '250 247 240', card: '255 252 248', border: '220 210 195', primary: '124 73 20', accent: '180 100 40', muted: '238 228 215', mutedForeground: '130 110 85', success: '76 140 74', warning: '190 120 30', danger: '185 50 50' }, mode: 'light' },
                      { id: 'midnight', colors: { background: '15 23 42', card: '30 41 59', border: '51 65 85', primary: '52 211 153', accent: '34 211 238', muted: '71 85 105', mutedForeground: '160 174 192', success: '52 211 153', warning: '251 191 36', danger: '248 113 113' }, mode: 'dark' },
                      { id: 'amoled', colors: { background: '0 0 0', card: '17 17 17', border: '38 38 38', primary: '139 92 246', accent: '236 72 153', muted: '64 64 64', mutedForeground: '163 163 163', success: '74 222 128', warning: '250 204 21', danger: '248 113 113' }, mode: 'dark' }
                    ];
                    const theme = themePresets.find(t => t.id === themeId) || themePresets[0];
                    const root = document.documentElement;
                    
                    Object.entries(theme.colors).forEach(([key, value]) => {
                      const cssVarName = '--theme-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
                      root.style.setProperty(cssVarName, value);
                    });

                    if (theme.mode === 'dark') {
                      root.classList.add('dark');
                    } else {
                      root.classList.remove('dark');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
