"use client"

import { useState, useEffect } from "react"

type Breakpoint = "mobile" | "sm" | "md" | "lg" | "xl"

/**
 * Hook que detecta o breakpoint atual do Tailwind e retorna helpers de UI.
 * Mobile-first: considera mobile < 640px, sm 640-768, md 768-1024, lg 1024+.
 */
export function useBreakpoint() {
    const [width, setWidth] = useState<number>(
        typeof window !== "undefined" ? window.innerWidth : 1024
    )

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const breakpoint: Breakpoint =
        width < 640 ? "mobile"
            : width < 768 ? "sm"
                : width < 1024 ? "md"
                    : width < 1280 ? "lg"
                        : "xl"

    return {
        breakpoint,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        width,
    }
}
