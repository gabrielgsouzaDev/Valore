export type MarketData = {
    symbol: string
    shortName?: string
    longName?: string
    currency: string
    regularMarketPrice: number
    regularMarketDayHigh: number
    regularMarketDayLow: number
    regularMarketChange: number
    regularMarketChangePercent: number
    marketCap?: number
    regularMarketVolume?: number
    regularMarketPreviousClose?: number
    regularMarketOpen?: number
    logourl?: string
    updatedAt: string
}

export type AssetCache = {
    ticker: string
    timestamp: number
    data: MarketData
}

export type AssetHistoryItem = {
    id?: number
    ticker: string
    timestamp: number
    price: number
}

export type PatrimonialSnapshot = {
    date: string
    totalNetWorth: number
}
