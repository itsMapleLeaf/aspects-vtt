import { expect, test } from "@playwright/test"
import { ByteUnit, convertBytes } from "./math.ts"

test.describe("convertBytes", () => {
	test("converts from B to KB", () => {
		expect(convertBytes(1024, ByteUnit.B, ByteUnit.KB)).toBe(1)
	})

	test("converts from KB to MB", () => {
		expect(convertBytes(1024, ByteUnit.KB, ByteUnit.MB)).toBe(1)
	})

	test("converts from MB to GB", () => {
		expect(convertBytes(1024, ByteUnit.MB, ByteUnit.GB)).toBe(1)
	})

	test("converts from GB to MB", () => {
		expect(convertBytes(1, ByteUnit.GB, ByteUnit.MB)).toBe(1024)
	})

	test("converts from MB to KB", () => {
		expect(convertBytes(1, ByteUnit.MB, ByteUnit.KB)).toBe(1024)
	})

	test("converts from KB to B", () => {
		expect(convertBytes(1, ByteUnit.KB, ByteUnit.B)).toBe(1024)
	})

	test("handles fractional inputs", () => {
		expect(convertBytes(0.5, ByteUnit.GB, ByteUnit.MB)).toBe(512)
	})

	test("rounds to two decimal places", () => {
		expect(convertBytes(1.5, ByteUnit.GB, ByteUnit.MB)).toBe(1536)
	})

	test("handles same unit conversion", () => {
		expect(convertBytes(1024, ByteUnit.KB, ByteUnit.KB)).toBe(1024)
	})

	test("handles negative inputs", () => {
		expect(convertBytes(-1, ByteUnit.GB, ByteUnit.MB)).toBe(-1024)
	})

	test("handles negative fractional inputs", () => {
		expect(convertBytes(-0.5, ByteUnit.GB, ByteUnit.MB)).toBe(-512)
	})
})
