import { createContext, use } from "react"

export const empty = Symbol("empty")
export type Empty = typeof empty

export function createStrictContext<T>() {
	return createContext<T | typeof empty>(empty)
}

export function useStrictContext<T>(context: React.Context<T | Empty>): T {
	const value = use(context)
	if (value === empty) {
		const error = new Error("context value not found")
		Error.captureStackTrace(error, useStrictContext)
		throw error
	}
	return value
}

export function createStrictContextApi<Props, Value>(
	init: (props: Props) => Value,
) {
	const Context = createStrictContext<Value>()

	function Provider(props: Props & { children: React.ReactNode }) {
		return (
			<Context.Provider value={init(props)}>{props.children}</Context.Provider>
		)
	}

	function useContextValue() {
		return useStrictContext(Context)
	}

	return [Provider, useContextValue] as const
}
