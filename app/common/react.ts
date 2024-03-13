import { useEffect, useState } from "react"
import { timeoutEffect } from "./async.ts"

export function useDelayedValue<T>(value: T, delay: number): T {
	const [delayed, setDelayed] = useState(value)
	useEffect(() => timeoutEffect(delay, setDelayed, value), [value, delay])
	return delayed
}

export function usePendingDelay(pendingInput: boolean) {
	return useDelayedValue(pendingInput, pendingInput ? 300 : 500)
}
