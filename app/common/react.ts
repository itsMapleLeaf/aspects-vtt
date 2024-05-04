import {
	type ReactNode,
	isValidElement,
	useCallback,
	useEffect,
	useInsertionEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react"
import { timeoutEffect } from "./async.ts"

export function useDelayedValue<T>(value: T, delay: number): T {
	const [delayed, setDelayed] = useState(value)
	useEffect(() => timeoutEffect(delay, setDelayed, value), [value, delay])
	return delayed
}

export function usePendingDelay(pendingInput: boolean) {
	return useDelayedValue(pendingInput, pendingInput ? 300 : 500)
}

export function useIsomorphicValue<ClientValue = undefined, ServerValue = undefined>(options: {
	client?: () => ClientValue
	server?: () => ServerValue
}) {
	return useSyncExternalStore<ClientValue | ServerValue | undefined>(
		noopSubscribe,
		() => options.client?.(),
		() => options.server?.(),
	)
}
const noopSubscribe = () => () => {}

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
	if (input !== state && predicate(input)) {
		setState(input)
	}
	return state
}

export function isReactNode(value: unknown): value is ReactNode {
	return (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		(Array.isArray(value) && value.every(isReactNode)) ||
		isValidElement(value)
	)
}
