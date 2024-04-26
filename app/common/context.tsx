import { createContext, use } from "react"

export const empty = Symbol("empty")
export type Empty = typeof empty

export function createNonEmptyContext<T>() {
	return createContext<T | typeof empty>(empty)
}

export function useNonEmptyContext<T>(context: React.Context<T | Empty>): T {
	const value = use(context)
	if (value === empty) {
		throw new Error("context value not found")
	}
	return value
}

export function wrapContextApi<Props, Value>(init: (props: Props) => Value) {
	const Context = createNonEmptyContext<Value>()

	function Provider(props: Props & { children: React.ReactNode }) {
		return <Context.Provider value={init(props)}>{props.children}</Context.Provider>
	}

	function useContextValue() {
		return useNonEmptyContext(Context)
	}

	return [Provider, useContextValue] as const
}
