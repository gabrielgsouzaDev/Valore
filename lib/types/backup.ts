import type { Asset } from "./core"
import type { Bank } from "./banking"
import type { CardExpense, CreditCard } from "./banking"
import type { Category } from "./budget"
import type { Goal } from "./goals"
import type { PatrimonialSnapshot } from "./market"
import type { ScheduledTransaction } from "./budget"
import type { Settings } from "./settings"

/** Dados brutos de um backup — consumido por importData(). */
export type BackupImportData = {
    _app?: "valore"
    _version?: number
    _exportedAt?: string
    assets?: Asset[]
    categories?: Category[]
    goals?: Goal[]
    settings?: Partial<Settings>
    transactions?: ScheduledTransaction[]
    creditCards?: CreditCard[]
    cardExpenses?: CardExpense[]
    banks?: Bank[]
    patrimonialHistory?: PatrimonialSnapshot[]
}

/** Dados do recharts tooltip para gráficos lazy-loaded. */
export type ChartTooltipPayload = {
    active?: boolean
    payload?: Array<{ value?: unknown; payload?: { name?: string } }>
}

/** Tipo para ícones lucide (lucide-react não exporta o tipo exato). */
export type LucideIcon = (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element
