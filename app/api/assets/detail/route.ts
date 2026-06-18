import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get("ticker")

    if (!ticker) {
        return NextResponse.json({ error: "Missing ticker parameter" }, { status: 400 })
    }

    const token = process.env.BRAPI_TOKEN

    if (!token) {
        return NextResponse.json({ error: "BRAPI_TOKEN is not configured" }, { status: 500 })
    }

    try {
        const response = await fetch(
            `https://brapi.dev/api/quote/${ticker}?token=${token}&range=1d&interval=1d&fundamental=true`
        )

        if (!response.ok) {
            throw new Error(`Brapi API error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
            return NextResponse.json({ error: "Ticker not found" }, { status: 404 })
        }

        const res = data.results[0]

        return NextResponse.json({
            symbol: res.symbol,
            shortName: res.shortName,
            longName: res.longName,
            currency: res.currency ?? "BRL",
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
        })
    } catch (error) {
        console.error("Error fetching market detail:", error)
        return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
    }
}
