import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseCurrency(value: string | number): number {
  if (typeof value === 'number') return value
  const cleanValue = value.replace(/[^\d,-]/g, '').replace(',', '.')
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}

/** Converte percentuais não-finitos (NaN, Infinity) em um fallback (0 por padrão). */
export function safePercent(value: number, fallback = 0): number {
    return Number.isFinite(value) ? value : fallback
}
