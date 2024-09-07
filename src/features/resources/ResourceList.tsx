import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export interface Resource {
	id: string
	name: string
	icon: React.ReactNode
	group: string
}

export interface ResourceListProps<T extends Resource>
	extends ComponentProps<"div"> {
	resources: T[]
	activeResourceId: string
	onSelectResource: (resource: T) => void
}

export function ResourceList<T extends Resource>({
	resources,
	activeResourceId,
	onSelectResource,
	...props
}: ResourceListProps<T>) {
	return (
		<div {...props} className={twMerge("flex flex-col gap-2", props.className)}>
			{resources.map((resource) => (
				<div key={resource.id} className="flex items-center gap-2">
					{resource.icon}
					<span>{resource.name}</span>
				</div>
			))}
		</div>
	)
}
