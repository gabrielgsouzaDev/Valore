import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Valore — Mission Control",
        short_name: "Valore",
        description: "Mission Control para seu portfólio de investimentos e finanças pessoais",
        start_url: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#0C0C0C",
        theme_color: "#D4AF37",
        scope: "/",
        lang: "pt-BR",
        dir: "ltr",
        categories: ["finance", "productivity"],
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        shortcuts: [
            {
                name: "Investimentos",
                short_name: "Invest.",
                description: "Abrir portfólio de investimentos",
                url: "/",
                icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
            },
            {
                name: "Economia",
                short_name: "Economia",
                description: "Abrir módulo de economia",
                url: "/economia",
                icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
            },
        ],
        screenshots: [],
    }
}
