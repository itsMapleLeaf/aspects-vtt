import { act, renderHook } from "@testing-library/react"
import { beforeEach, expect, test, vi } from "vitest"
import {
	INITIAL_PENDING_DELAY,
	MINIMUM_PENDING_DURATION,
	usePendingDelay,
} from "./usePendingDelay.ts"

beforeEach(() => {
	vi.useFakeTimers()
	return () => vi.useRealTimers()
})

test("usePendingDelay transitions to true after delay", async () => {
	const { result, rerender } = renderHook(usePendingDelay, {
		initialProps: false,
	})
	expect(result.current).toBe(false)

	rerender(true)
	expect(result.current).toBe(false)

	await act(() => vi.advanceTimersByTime(INITIAL_PENDING_DELAY + 10))
	expect(result.current).toBe(true)
})

test("usePendingDelay maintains minimum pending duration", async () => {
	const { result, rerender } = renderHook(
		(input: boolean) => usePendingDelay(input),
		{
			initialProps: true,
		},
	)

	// Wait for initial delay
	await act(() => vi.advanceTimersByTime(INITIAL_PENDING_DELAY))
	expect(result.current).toBe(true)

	// Set input to false
	rerender(false)
	expect(result.current).toBe(true) // Should still be true due to minimum duration

	// Advance time but not enough to reach minimum duration
	const partialTime = 400
	await act(() => vi.advanceTimersByTime(partialTime))
	expect(result.current).toBe(true)

	// Advance remaining time to reach minimum duration
	await act(() =>
		vi.advanceTimersByTime(MINIMUM_PENDING_DURATION - partialTime),
	)
	expect(result.current).toBe(false)
})

test("usePendingDelay handles rapid input changes", async () => {
	const { result, rerender } = renderHook(
		(input: boolean) => usePendingDelay(input),
		{
			initialProps: false,
		},
	)

	// Start pending
	rerender(true)
	expect(result.current).toBe(false)

	// Cancel before delay
	rerender(false)
	await act(() => vi.advanceTimersByTime(INITIAL_PENDING_DELAY))
	expect(result.current).toBe(false)
})
