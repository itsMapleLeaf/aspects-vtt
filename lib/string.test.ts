import { describe, expect, it } from "vitest"
import { formatTitle } from "./string.ts"

describe("formatTitle", () => {
	it("capitalizes the first letter of a single word", () => {
		expect(formatTitle("embolden")).toBe("Embolden")
	})

	it("properly formats camelCase strings", () => {
		expect(formatTitle("dancingLights")).toBe("Dancing Lights")
	})

	it("lowercases article words", () => {
		expect(formatTitle("auraOfWeakness")).toBe("Aura of Weakness")
	})

	it("handles mixed cases and multiple articles", () => {
		expect(formatTitle("theBookOfTheDead")).toBe("The Book of the Dead")
	})

	it("handles strings with numbers", () => {
		expect(formatTitle("level2Spell")).toBe("Level 2 Spell")
	})

	it("handles strings with uppercase acronyms", () => {
		expect(formatTitle("summonNPC")).toBe("Summon NPC")
	})
})
