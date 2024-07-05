import { test } from "bun:test"
import { v } from "convex/values"
import assert from "node:assert/strict"
import { partial } from "./partial.ts"

test("partial", () => {
	const input = {
		name: v.string(),
		age: v.optional(v.number()),
	}

	const output = partial(input)

	assert.equal(output.name.kind, "string")
	assert.equal(output.name.isOptional, "optional")
	assert.equal(output.age.kind, "float64")
	assert.equal(output.age.isOptional, "optional")
})
