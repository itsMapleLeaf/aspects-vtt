import {
	useCallback,
	useEffect,
	useInsertionEffect,
	useRef,
	useState,
} from "react"
import { timeoutEffect } from "../async.ts"

export type AsyncState<Args, Return> = Readonly<
	| { status: "initial"; args?: never; data?: never; error?: never }
	| { status: "pending"; args: Args; data?: never; error?: never }
	| { status: "success"; args?: never; data: Awaited<Return>; error?: never }
	| { status: "error"; args?: never; data?: never; error: Error }
>

export function useAsyncState<Args, Return>(fn: (args: Args) => Return) {
	const [state, setState] = useState<AsyncState<Args, Return>>({
		status: "initial",
	})
	const abortControllerRef = useRef<AbortController>(undefined)

	async function run(args: Args) {
		abortControllerRef.current?.abort()

		const controller = (abortControllerRef.current = new AbortController())
		setState({ status: "pending", args })

		try {
			const data = await fn(args)
			if (!controller.signal.aborted) {
				setState({ status: "success", data })
			}
		} catch (error) {
			if (!controller.signal.aborted) {
				console.error(error)
				setState({
					status: "error",
					error: new Error(undefined, { cause: error }),
				})
			}
		}
	}

	return [state, run] as const
}

export function useDelayedValue<T>(value: T, delay: number, init?: T): T {
	const [delayed, setDelayed] = useState(init ?? value)
	useEffect(() => timeoutEffect(delay, setDelayed, value), [value, delay])
	return delayed
}

export function usePendingDelay(pendingInput: boolean) {
	return useDelayedValue(pendingInput, pendingInput ? 100 : 500, false)
}

export function useEffectEvent<Args extends unknown[], Return>(
	fn: (...args: Args) => Return,
) {
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
