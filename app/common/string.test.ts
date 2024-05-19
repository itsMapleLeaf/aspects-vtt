import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { lines, splitByCase } from "./string.ts"

describe("lines", () => {
	it("yields each line", () => {
		const text = `i love
cute
boys`
		assert.deepEqual([...lines(text)], ["i love", "cute", "boys"])
	})

	it("yields a single string if there are no lines", () => {
		const text = `no lines`
		assert.deepEqual([...lines(text)], ["no lines"])
	})

	it("yields nothing if the input is empty", () => {
		const text = ``
		assert.deepEqual([...lines(text)], [])
	})

	it("yields the white space if the input is just white space", () => {
		const text = `   `
		assert.deepEqual([...lines(text)], ["   "])
	})
})

describe("splitByCase", () => {
	it("splits by non-letters and casing changes", () => {
		assert.deepEqual(splitByCase("PascalCasedString"), [
			"Pascal",
			"Cased",
			"String",
		])
		assert.deepEqual(splitByCase("snake_cased_string"), [
			"snake",
			"cased",
			"string",
		])
		assert.deepEqual(splitByCase("camelCasedString"), [
			"camel",
			"Cased",
			"String",
		])
	})
})
