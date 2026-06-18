"use client"

import { useState, useEffect } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Asset, MarketData } from "@/lib/types"

const CACHE_TTL = 15 * 60 * 1000 // 15 minutos em milissegundos

export function useAssetDetail(assetId: number) {
    const [marketData, setMarketData] = useState<MarketData | null>(null)
    const [isLoadingMarket, setIsLoadingMarket] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 1. Obter dados locais do ativo (Dexie)
    const asset = useLiveQuery(() => db.assets.get(assetId), [assetId])

    useEffect(() => {
        if (!asset || !asset.ticker) return

        const ticker = asset.ticker

        async function fetchMarketData(signal: AbortSignal) {
            try {
                // a. Verificar cache no Dexie
                const cache = await db.assetCache.get(ticker)

                if (cache && (Date.now() - cache.timestamp < CACHE_TTL)) {
                    setMarketData(cache.data)
                    return
                }

                // b. Se não houver cache ou estiver expirado, buscar via proxy Next.js
                setIsLoadingMarket(true)

                const response = await fetch(`/api/assets/detail?ticker=${ticker}`, { signal })
                const res = await response.json()

                if (res.symbol) {
                    const newMarketData: MarketData = {
                        symbol: res.symbol,
                        shortName: res.shortName,
                        longName: res.longName,
                        currency: res.currency || "BRL",
                        regularMarketPrice: res.regularMarketPrice,
                        regularMarketDayHigh: res.regularMarketDayHigh,
                        regularMarketDayLow: res.regularMarketDayLow,
                        regularMarketChange: res.regularMarketChange,
                        regularMarketChangePercent: res.regularMarketChangePercent,
                        marketCap: res.marketCap,
                        regularMarketVolume: res.regularMarketVolume,
                        regularMarketPreviousClose: res.regularMarketPreviousClose,
                        regularMarketOpen: res.regularMarketOpen,
                        logourl: res.logourl,
                        updatedAt: new Date().toISOString()
                    }

                    // c. Salvar no cache
                    await db.assetCache.put({
                        ticker,
                        timestamp: Date.now(),
                        data: newMarketData
                    })

                    // d. Salvar histórico básico para faixas rápidas (opcional)
                    await db.assetHistory.add({
                        ticker,
                        timestamp: Date.now(),
                        price: res.regularMarketPrice
                    })

                    // Eviction: limpar entradas antigas sem bloquear UX
                    db.assetCache
                        .where("timestamp")
                        .below(Date.now() - 24 * 60 * 60 * 1000)
                        .delete()
                        .catch(() => {})

                    db.assetHistory
                        .where("timestamp")
                        .below(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        .delete()
                        .catch(() => {})

                    setMarketData(newMarketData)
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return

                console.error("Erro ao buscar dados de mercado:", err)
                setError("Não foi possível carregar os dados de mercado.")

                // Fallback para cache expirado se a API falhar
                const staleCache = await db.assetCache.get(ticker)
                if (staleCache) setMarketData(staleCache.data)
            } finally {
                setIsLoadingMarket(false)
            }
        }

        const controller = new AbortController()
        fetchMarketData(controller.signal)
        return () => controller.abort()
    }, [asset])

    return {
        asset,
        marketData,
        isLoading: !asset || isLoadingMarket,
        error
    }
}
