export type ThemePreset = {
    id: string
    name: string
    description: string
    mode?: "light" | "dark"
    colors: {
        background: string
        card: string
        cardHover: string
        border: string
        primary: string
        primaryForeground: string
        accent: string
        accentForeground: string
        muted: string
        mutedForeground: string
        success: string
        successForeground: string
        warning: string
        danger: string
    }
}
