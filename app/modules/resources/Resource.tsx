import type { Location } from "@remix-run/react"
import type { ComponentType } from "react"
import type { ZodType, ZodTypeDef } from "zod"

export interface Resource {
	readonly id: string
	readonly name: string
	readonly dragData: object
	readonly TreeItemElement: ComponentType<{}>
}

export interface ButtonResourceAction {
	type: "button"
	onClick: () => void
}

export interface LinkResourceAction {
	type: "link"
	location: string | Location
}

export interface ResourceMenuItemProps {
	afterCreate: () => void
}

export abstract class ResourceClass<T extends Resource> {
	static readonly resourceTypes = new Map<string, ResourceClass<Resource>>()

	abstract readonly dragDataSchema: ZodType<T["dragData"], ZodTypeDef, unknown>
	abstract readonly CreateMenuItem: ComponentType<ResourceMenuItemProps>

	constructor() {
		ResourceClass.resourceTypes.set(this.constructor.name, this)
	}

	abstract create(...args: unknown[]): T

	parseDragData(input: string, ..._args: unknown[]): T["dragData"] | null {
		try {
			return this.dragDataSchema.parse(JSON.parse(input))
		} catch {
			return null
		}
	}
}
