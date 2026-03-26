import fs from "fs"

const file = "app/transacoes/page.tsx" // wait, error was in components/onboarding-wizard.tsx
const path = "components/onboarding-wizard.tsx"
const code = fs.readFileSync(path, 'utf8')

// Try to parse it using regular expression or babel to find the exact line
// actually let's just use babel/parser
try {
    const babel = require('@babel/parser');
    babel.parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
    });
    console.log("No syntax error found via babel/parser!")
} catch (e) {
    console.log("Babel Parse Error:", e.message, "at line", e.loc?.line, "col", e.loc?.column)
    if (e.loc) {
        const lines = code.split('\\n');
        console.log("Line:", lines[e.loc.line - 1]);
    }
}
