import { type ReactNode, isValidElement } from "react"

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
