"use client"

import { useEffect, useState } from "react"
import { liveQuery } from "dexie"

/**
 * Leitura reativa do Dexie sem depender do dexie-react-hooks.
 * Assina o observável liveQuery diretamente; o subscribe dispara a cada
 * mudança nas tabelas lidas pelo querier. Corrige o caso em que o
 * useLiveQuery não re-renderizava sob React 19 (writes persistiam mas a
 * UI só atualizava após reload).
 *
 * Os queriers do useLiveDb são estáticos (ex.: () => db.assets.toArray()),
 * então a assinatura é criada uma vez por montagem.
 */
export function useLive<T>(querier: () => T | Promise<T>): T | undefined {
    const [value, setValue] = useState<T | undefined>(undefined)

    useEffect(() => {
        const subscription = liveQuery(querier).subscribe({
            next: (v) => setValue(() => v),
            error: (err) => console.error("useLive:", err),
        })
        return () => subscription.unsubscribe()
        // querier estático nas chamadas do useLiveDb; assina uma vez.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return value
}
