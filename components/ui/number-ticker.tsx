"use client"

import { useEffect, useRef, memo } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export type NumberTickerProps = {
    value: number
    direction?: "up" | "down"
    delay?: number
    className?: string
    decimalPlaces?: number
    currency?: boolean
    isPrivate?: boolean
}

const NumberTicker = ({
    value,
    direction = "up",
    delay = 0,
    className,
    decimalPlaces = 2,
    currency = false,
    isPrivate = false,
}: NumberTickerProps) => {
    const ref = useRef<HTMLSpanElement>(null)
    const motionValue = useMotionValue(direction === "down" ? value : 0)
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 300,
    })
    const isInView = useInView(ref, { once: true, margin: "0px" })

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                motionValue.set(value)
            }, delay * 1000)
        }
    }, [motionValue, isInView, delay, value])

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                let formattedValue = Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: decimalPlaces,
                    maximumFractionDigits: decimalPlaces,
                    style: currency ? "currency" : "decimal",
                    currency: currency ? "BRL" : undefined,
                }).format(Number(latest.toFixed(decimalPlaces)))

                ref.current.textContent = formattedValue
            }
        })
    }, [springValue, decimalPlaces, currency])

    return (
        <span
            className={cn(
                "inline-block font-mono tabular-nums text-inherit tracking-tight transition-all duration-700",
                isPrivate && "blur-xl select-none pointer-events-none opacity-40 scale-[0.98]",
                className,
            )}
            ref={ref}
        />
    )
}

export default memo(NumberTicker)
