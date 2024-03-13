import { useRef } from "react"

export function useStableQueryValue<T>(value: T): readonly [value: T, pending: boolean] {
	const ref = useRef(value)
	if (ref.current !== value && value !== undefined) {
		ref.current = value
	}
	return [ref.current, value === undefined]
}
