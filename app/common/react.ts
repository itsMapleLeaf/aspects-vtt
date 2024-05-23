import {
	type ReactNode,
	isValidElement,
	useCallback,
	useEffect,
	useInsertionEffect,
	useRef,
	useState,
} from "react"
import { timeoutEffect } from "./async.ts"

export function useDelayedValue<T>(value: T, delay: number, init?: T): T {
	const [delayed, setDelayed] = useState(init ?? value)
	useEffect(() => timeoutEffect(delay, setDelayed, value), [value, delay])
	return delayed
}

export function usePendingDelay(pendingInput: boolean) {
	return useDelayedValue(pendingInput, pendingInput ? 300 : 500, false)
}

export function useEffectEvent<Args extends unknown[], Return>(fn: (...args: Args) => Return) {
	const ref = useRef((...args: Args): Return => {
		throw new Error("Attempted to call effect event callback during render")
	})

	useInsertionEffect(() => {
		ref.current = fn
	})

	return useCallback((...args: Args) => ref.current(...args), [])
}

export function useFilter<In, Out extends In>(
	input: In,
	predicate: (input: In) => input is Out,
): In | Out
export function useFilter<T>(input: T, predicate: (input: T) => unknown): T
export function useFilter<T>(input: T, predicate: (input: T) => unknown) {
	const [state, setState] = useState<T>(input)
	useEffect(() => {
		if (predicate(input)) setState(input)
	}, [input, predicate])
	return state
}

export function isReactNode(value: unknown): value is ReactNode {
	return (
		value == null ||
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "bigint" ||
		typeof value === "boolean" ||
		value instanceof Promise ||
		isValidElement(value) ||
		(Array.isArray(value) && value.every(isReactNode))
	)
}
