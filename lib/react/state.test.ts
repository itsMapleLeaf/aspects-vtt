import { renderHook } from "@testing-library/react"
import { act } from "react"
import { expect, test } from "vitest"
import { useFilter } from "./state.ts"

test("useFilter", async () => {
	const { result, rerender } = renderHook((value: number = 0) =>
		useFilter(value, (it) => it > 5),
	)

	// should always use the initial value even if it doesn't pass the filter
	expect(result.current).toBe(0)

	// only changes if the condition passes
	act(() => rerender(5))
	expect(result.current).toBe(0)
	act(() => rerender(10))
	expect(result.current).toBe(10)
})
