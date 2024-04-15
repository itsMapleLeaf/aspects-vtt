import { useContext } from "react"

export const empty = Symbol("empty")
export type Empty = typeof empty

export function useNonEmptyContext<T>(context: React.Context<T | Empty>): T {
	const value = useContext(context)
	if (value === empty) {
		throw new Error("context value not found")
	}
	return value
}
