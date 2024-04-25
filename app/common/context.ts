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
