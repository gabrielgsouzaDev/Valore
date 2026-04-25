"use client"

import dynamic from "next/dynamic"
import * as Recharts from "recharts"

/**
 * Recharts components wrapper.
 *
 * O ResponsiveContainer precisa ser renderizado client-side-only (ssr: false)
 * para evitar problemas de hidratação e garantir que ele pegue as dimensões do container pai.
 * 
 * ATENÇÃO: Os componentes filhos do Recharts (Area, Pie, XAxis, etc.) NÃO PODEM
 * ser envelopados por `next/dynamic`. O Recharts precisa inspecionar a árvore React
 * e o displayName dos filhos. Se eles estiverem em um componente dinâmico (Loadable),
 * o Recharts não os reconhece e o gráfico não é renderizado.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynamicResponsiveContainer = dynamic(
    () => import("recharts").then(m => m.ResponsiveContainer as any),
    { ssr: false }
)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ResponsiveContainer = DynamicResponsiveContainer as any

// Exporta os componentes originais sobrescrevendo os tipos restritivos do Recharts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AreaChart = Recharts.AreaChart as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Area = Recharts.Area as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const XAxis = Recharts.XAxis as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const YAxis = Recharts.YAxis as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Tooltip = Recharts.Tooltip as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ReferenceLine = Recharts.ReferenceLine as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ComposedChart = Recharts.ComposedChart as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CartesianGrid = Recharts.CartesianGrid as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PieChart = Recharts.PieChart as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Pie = Recharts.Pie as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Cell = Recharts.Cell as any
