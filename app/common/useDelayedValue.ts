import { useEffect, useState } from "react"
import { timeoutEffect } from "./timeoutEffect.ts"

export function useDelayedValue<T>(value: T, delay: number): T {
	const [delayed, setDelayed] = useState(value)
	useEffect(() => timeoutEffect(delay, setDelayed, value), [value, delay])
	return delayed
}
