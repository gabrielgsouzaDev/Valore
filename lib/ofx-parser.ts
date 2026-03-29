/**
 * Valore Native Statement Parser (OFX & CSV)
 *
 * Analisa arquivos financeiros pesados inteiramente no Client-Side via Regex/Heurística.
 * Evita o uso de bibliotecas de Node.js e previne a exposição de dados sensíveis ao servidor.
 */

export interface ParsedTransaction {
    id: string
    date: Date
    amount: number
    description: string
    type: "entrada" | "saída"
    transactionHash?: string
}

export function parseStatement(fileContent: string, fileName: string): ParsedTransaction[] {
    if (fileName.toLowerCase().endsWith('.csv')) {
        return parseCSV(fileContent)
    }
    return parseOFX(fileContent)
}

function parseCSV(csvString: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []

    // Divide por linhas e remove linhas vazias
    const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0)

    if (lines.length < 2) return transactions // Precisa ter pelo menos cabeçalho e 1 linha

    // Identificar delimitador (vírgula ou ponto-e-vírgula)
    const delimiter = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ','

    for (let i = 1; i < lines.length; i++) { // Ignora cabeçalho (linha 0)
        // Divide lidando com aspas duplas (ex: "Compra, Supermercado")
        const regex = new RegExp(`(?:"([^"]*)"|([^${delimiter}]+))`, 'g')
        const cols: string[] = []
        let match
        while ((match = regex.exec(lines[i])) !== null) {
            if (match[0] === '') { regex.lastIndex++; continue; }
            cols.push(match[1] || match[2] || "")
        }

        if (cols.length < 3) continue

        // Heurística de Encontrar a Coluna de Data (dd/mm/yyyy ou yyyy-mm-dd)
        let dateObj = new Date()
        let dateFound = false
        const dateColIndex = cols.findIndex(col => col.match(/\d{2}\/\d{2}\/\d{4}/) || col.match(/\d{4}-\d{2}-\d{2}/))

        if (dateColIndex !== -1) {
            const dStr = cols[dateColIndex].trim()
            if (dStr.includes('/')) {
                const parts = dStr.split('/')
                dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
            } else {
                dateObj = new Date(dStr)
            }
            dateFound = true
        }

        // Heurística de Encontrar a Coluna de Valor Numérico
        // O valor geralmente é o que tem dígitos com formatação de moeda ou sinais
        let amount = 0
        let amountFound = false
        // Itera de trás pra frente (é mais comum valor estar no fim)
        for (let c = cols.length - 1; c >= 0; c--) {
            if (c === dateColIndex) continue
            // Tenta limpar moeda: "R$ -10,00", "-10.00", "1.000,00"
            let numStr = cols[c].replace(/[R$\s]/g, '').trim()
            // Trata separadores de milhar x decimais do padrão brasileiro versus americano
            // Se tem vírgula e ponto, ex: 1.000,50 -> remove ponto e troca vírgula por ponto
            if (numStr.includes('.') && numStr.includes(',')) {
                // assume padrão BR: 1.000,50
                const lastPoint = numStr.lastIndexOf('.')
                const lastComma = numStr.lastIndexOf(',')
                if (lastComma > lastPoint) { // 1.000,50
                    numStr = numStr.replace(/\./g, '').replace(',', '.')
                } else { // 1,000.50 (americano)
                    numStr = numStr.replace(/,/g, '')
                }
            } else if (numStr.includes(',')) {
                numStr = numStr.replace(',', '.') // Apenas vírgula: -15,50 -> -15.50
            }

            const parsed = parseFloat(numStr)
            if (!isNaN(parsed) && numStr.match(/\d/)) {
                amount = parsed
                amountFound = true
                break
            }
        }

        if (!dateFound || !amountFound) continue

        // Heurística de Descrição (a coluna com texto mais longo que não é data nem valor numérico óbvio)
        let description = "Transação CSV"
        // Pega colunas que não são número nem data, e pega a mais longa
        const textCols = cols.filter((c, idx) => {
            if (idx === dateColIndex) return false
            const isNum = !isNaN(parseFloat(c.replace(/[R$\s,.]/g, '')))
            return !isNum && c.trim().length > 0
        }).sort((a, b) => b.length - a.length)

        if (textCols.length > 0) {
            description = textCols[0].trim()
        }

        const hashSource = `${dateObj.toISOString().split('T')[0]}_${amount}_${description.trim()}`
        const transactionHash = hashSource.toLowerCase().replace(/\s+/g, '')

        transactions.push({
            id: Math.random().toString(36).substring(7),
            date: dateObj,
            amount: amount,
            description: description,
            type: amount >= 0 ? "entrada" : "saída",
            transactionHash
        })
    }

    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
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

        const hashSource = `${date.toISOString().split('T')[0]}_${amount}_${description.trim()}`
        const transactionHash = hashSource.toLowerCase().replace(/\s+/g, '')

        transactions.push({
            id,
            date,
            amount,
            description,
            type: amount >= 0 ? "entrada" : "saída",
            transactionHash
        })
    }

    // Ordenar da mais antiga para a mais recente
    return transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
}
