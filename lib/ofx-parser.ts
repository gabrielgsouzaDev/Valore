/**
 * Valore Native OFX Parser
 *
 * Analisa arquivos OFX pesados inteiramente no Client-Side via Regex.
 * Evita o uso de bibliotecas pesadas de Node.js e previne a exposição de dados sensíveis ao servidor.
 */

export interface ParsedTransaction {
    id: string
    date: Date
    amount: number
    description: string
    type: "entrada" | "saída"
}

export function parseOFX(ofxString: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []

    // OFX às vezes é problemático com tags não fechadas. Regex resolve de forma robusta.
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g

    let match
    while ((match = stmtTrnRegex.exec(ofxString)) !== null) {
        const trnBlock = match[1]

        // Extrai Tipo (DEBIT, CREDIT, etc)
        const typeMatch = trnBlock.match(/<TRNTYPE>(.*?)(?:\r\n|\n|<)/)
        const isCredit = typeMatch && (typeMatch[1].trim() === 'CREDIT' || typeMatch[1].trim() === 'DEP')

        // Extrai Data (DTPOSTED Formato YYYYMMDD...)
        const dateMatch = trnBlock.match(/<DTPOSTED>(\d{8})/)
        let date = new Date()
        if (dateMatch) {
            const dateStr = dateMatch[1] // YYYYMMDD
            const year = parseInt(dateStr.substring(0, 4))
            const month = parseInt(dateStr.substring(4, 6)) - 1
            const day = parseInt(dateStr.substring(6, 8))
            date = new Date(year, month, day)
        }

        // Extrai Valor
        const amountMatch = trnBlock.match(/<TRNAMT>([-\d.,]+)/)
        let amount = 0
        if (amountMatch) {
            amount = parseFloat(amountMatch[1].replace(',', '.'))
        }

        // Extrai Descrição / Nome
        const memoMatch = trnBlock.match(/<MEMO>(.*?)(?:\r\n|\n|<)/)
        const nameMatch = trnBlock.match(/<NAME>(.*?)(?:\r\n|\n|<)/)
        const description = (nameMatch ? nameMatch[1] : (memoMatch ? memoMatch[1] : "Transação Importada")).trim()

        // Extrai ID Único
        const fitidMatch = trnBlock.match(/<FITID>(.*?)(?:\r\n|\n|<)/)
        const id = fitidMatch ? fitidMatch[1].trim() : Math.random().toString(36).substring(7)

        transactions.push({
            id,
            date,
            amount,
            description,
            type: amount >= 0 ? "entrada" : "saída"
        })
    }

    // Ordenar da mais antiga para a mais recente
    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
}
