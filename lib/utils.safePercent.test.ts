import { describe, it, expect } from "vitest"
import { safePercent } from "@/lib/utils"

describe("safePercent", () => {
    it("0/0 vira 0", () => expect(safePercent((0 / 0))).toBe(0))
    it("Infinity vira 0", () => expect(safePercent(1 / 0)).toBe(0))
    it("número normal passa", () => expect(safePercent(42.5)).toBe(42.5))
    it("respeita fallback custom", () => expect(safePercent(NaN, -1)).toBe(-1))
})
