import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const tickersParam = searchParams.get("tickers")

    if (!tickersParam) {
        return NextResponse.json({ error: "Missing tickers parameter" }, { status: 400 })
    }

    const token = process.env.BRAPI_TOKEN

    if (!token) {
        return NextResponse.json({ error: "BRAPI_TOKEN is not configured" }, { status: 500 })
    }

    try {
        // Fetch quotes for multiple tickers at once
        const response = await fetch(`https://brapi.dev/api/quote/${tickersParam}?token=${token}`)

        if (!response.ok) {
            throw new Error(`Brapi API error: ${response.status}`)
        }

        const data = await response.json()

        // Map the result to an easier format for the frontend
        const prices: Record<string, number> = {}

        if (data.results && Array.isArray(data.results)) {
            data.results.forEach((item: any) => {
                if (item.symbol && item.regularMarketPrice) {
                    prices[item.symbol] = item.regularMarketPrice
                }
            })
        }

        return NextResponse.json({ prices })

    } catch (error) {
        console.error("Error syncing from Brapi:", error)
        return NextResponse.json({ error: "Failed to sync assets" }, { status: 500 })
    }
}
