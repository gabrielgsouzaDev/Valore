import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
        return NextResponse.json({ error: "Missing query parameter" }, { status: 400 })
    }

    const token = process.env.BRAPI_TOKEN

    if (!token) {
        return NextResponse.json({ error: "BRAPI_TOKEN is not configured" }, { status: 500 })
    }

    try {
        // Brapi /quote/list endpoint returns detailed info including name, close price, etc.
        const response = await fetch(`https://brapi.dev/api/quote/list?search=${query}&token=${token}`, {
            next: { revalidate: 3600 } // Cache results to save API calls
        })

        if (!response.ok) {
            throw new Error(`Brapi API error: ${response.status}`)
        }

        const data = await response.json()

        // Return only the first 10 results to keep the payload small and UI fast
        return NextResponse.json({
            results: data.stocks?.slice(0, 10).map((stock: any) => ({
                ticker: stock.stock,
                name: stock.name,
                price: stock.close,
                type: stock.type || "Ação", // Usually "stock" or "fund"
                logo: stock.logo
            })) || []
        })

    } catch (error) {
        console.error("Error fetching from Brapi:", error)
        return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
    }
}
