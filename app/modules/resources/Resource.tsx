import type { Location } from "@remix-run/react"
import type { ReactNode } from "react"
import type { ZodType, ZodTypeDef } from "zod"

export interface Resource {
	readonly id: string
	readonly name: string
	readonly dragData: object
	renderTreeElement(): ReactNode
}

export interface ButtonResourceAction {
	type: "button"
	onClick: () => void
}

export interface LinkResourceAction {
	type: "link"
	location: string | Location
}

export abstract class ResourceClass<T extends Resource> {
	abstract readonly dragDataSchema: ZodType<T["dragData"], ZodTypeDef, unknown>

	abstract create(...args: unknown[]): T

	parseDragData(input: string, ..._args: unknown[]): T["dragData"] | null {
		try {
			return this.dragDataSchema.parse(JSON.parse(input))
		} catch {
			return null
		}
	}
}
