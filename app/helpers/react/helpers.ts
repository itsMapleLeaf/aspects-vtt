import { isValidElement, type ReactNode } from "react"
import type { Nullish } from "../types.ts"

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
export function combineRefs<T>(...refs: Array<Nullish<React.Ref<T>>>) {
	return (element: T | null) => {
		for (const ref of refs) {
			if (typeof ref === "function") {
				ref(element)
			} else if (ref != null) {
				ref.current = element
			}
		}
	}
}
