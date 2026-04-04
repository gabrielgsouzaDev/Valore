"use client"

import { useState } from "react"
import type { Asset } from "@/lib/types"

/**
 * Hook para gerenciar o estado de edição da tabela de atualização rápida.
 */
export function useUpdateTable(onUpdate: (id: number, ...args: any[]) => void) {
    const [editingAsset, setEditingAsset] = useState<number | null>(null)
    const [tempValues, setTempValues] = useState({
        quantity: "",
        price: "",
        ceiling: "",
        priority: "",
        average: "",
        dividend: ""
    })

    const startEditing = (asset: Asset) => {
        setEditingAsset(asset.id)
        setTempValues({
            quantity: asset.quantity.toString(),
            price: asset.price.toString(),
            ceiling: asset.ceilingPrice?.toString() || "",
            priority: asset.priority?.toString() || "",
            average: asset.averagePrice?.toString() || "",
            dividend: asset.annualDividend?.toString() || ""
        })
    }

    const handleUpdate = (id: number) => {
        const quantity = Number(tempValues.quantity) || 0
        const price = Number(tempValues.price) || 0
        const ceiling = tempValues.ceiling === "" ? undefined : Number(tempValues.ceiling)
        const priority = tempValues.priority === "" ? undefined : Number(tempValues.priority)
        const average = tempValues.average === "" ? undefined : Number(tempValues.average)
        const dividend = tempValues.dividend === "" ? undefined : Number(tempValues.dividend)

        if (!isNaN(quantity) && !isNaN(price)) {
            onUpdate(id, quantity, price, ceiling, priority, average, dividend)
            setEditingAsset(null)
        }
    }

    const cancelEditing = () => setEditingAsset(null)

    const updateValue = (field: keyof typeof tempValues, value: string) => {
        setTempValues(prev => ({ ...prev, [field]: value }))
    }

    return {
        editingAsset,
        tempValues,
        startEditing,
        handleUpdate,
        cancelEditing,
        updateValue
    }
}
