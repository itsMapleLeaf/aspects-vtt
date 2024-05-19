import { describe, expect, it } from "bun:test"
import { lines, splitByCase } from "./string.ts"

describe("lines", () => {
	it("yields each line", () => {
		const text = `i love
cute
boys`
		expect([...lines(text)]).toEqual(["i love", "cute", "boys"])
	})

	it("yields a single string if there are no lines", () => {
		const text = `no lines`
		expect([...lines(text)]).toEqual(["no lines"])
	})

	it("yields nothing if the input is empty", () => {
		const text = ``
		expect([...lines(text)]).toEqual([])
	})

	it("yields the white space if the input is just white space", () => {
		const text = `   `
		expect([...lines(text)]).toEqual(["   "])
	})
})

describe("splitByCase", () => {
	it("splits by non-letters and casing changes", () => {
		expect(splitByCase("PascalCasedString")).toEqual([
			"Pascal",
			"Cased",
			"String",
		])
		expect(splitByCase("snake_cased_string")).toEqual([
			"snake",
			"cased",
			"string",
		])
		expect(splitByCase("camelCasedString")).toEqual([
			"camel",
			"Cased",
			"String",
		])
	})
})
