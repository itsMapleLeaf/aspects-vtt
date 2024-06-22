import type { Location } from "@remix-run/react"
import type { ComponentType, ReactNode } from "react"
import type { ZodType, ZodTypeDef } from "zod"
import type { JsonObject } from "~/helpers/json.ts"

export interface Resource {
	readonly id: string
	readonly name: string
	readonly dragData: object
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

export interface ResourceDefinitionConfig {
	resource: Resource
	createArgs: unknown[]
	dragData: unknown
	treeItemProps: Record<string, unknown>
}

export interface RegisteredResourceDefinition {
	readonly name: string
	readonly CreateMenuItem: ComponentType<ResourceMenuItemProps>
}

export interface ResourceDefinition<
	Config extends ResourceDefinitionConfig = ResourceDefinitionConfig,
> extends RegisteredResourceDefinition {
	readonly create: (...args: Config["createArgs"]) => Config["resource"]
	readonly dragDataSchema: ZodType<Config["dragData"], ZodTypeDef, JsonObject>
	readonly TreeItem: (props: Config["treeItemProps"]) => ReactNode
}

const resourceDefinitions = new Map<string, RegisteredResourceDefinition>()

export function defineResource<
	resource extends Resource,
	createArgs extends unknown[],
	dragData,
	treeItemProps extends Record<string, unknown>,
>(
	definition: ResourceDefinition<{
		resource: resource
		createArgs: createArgs
		dragData: dragData
		treeItemProps: treeItemProps
	}>,
) {
	resourceDefinitions.set(definition.name, definition)
	return definition
}

export function* listResourceDefinitions() {
	yield* resourceDefinitions.values()
}

export function parseResourceDragData<Config extends ResourceDefinitionConfig>(
	definition: ResourceDefinition<Config>,
	input: string,
): Config["dragData"] | null {
	try {
		return definition.dragDataSchema.parse(JSON.parse(input))
	} catch {
		return null
	}
}
