import { groupBy } from "lodash-es"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { heading2xl, innerPanel, input } from "../../ui/styles.ts"

export interface Resource {
	id: string
	name: string
	icon: React.ReactNode
	section: string
}

export interface ResourceListProps<T extends Resource>
	extends ComponentProps<"div"> {
	resources: T[]
	activeResourceId: string | null | undefined
	onSelectResource: (resource: T) => void

	search: string
	onSearchChange: (search: string) => void
}

export function ResourceList<T extends Resource>({
	resources,
	activeResourceId,
	onSelectResource,

	search,
	onSearchChange,

	...props
}: ResourceListProps<T>) {
	const sections = groupBy(resources, (it) => it.section)
	return (
		<div className="flex h-full flex-col gap-2">
			<div className="flex gap">
				<input
					type="text"
					placeholder="Search"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className={input("flex-1")}
				/>
			</div>
			<div
				{...props}
				className={twMerge(
					"flex min-h-0 flex-1 flex-col overflow-y-auto gap",
					props.className,
				)}
			>
				{Object.entries(sections).map(([section, resources]) => (
					<section key={section}>
						<h3 className={heading2xl("mb-1 opacity-50")}>{section}</h3>
						<ul className="flex flex-col gap-1">
							{resources.map((resource) => (
								<li key={resource.id} className="contents">
									<button
										type="button"
										className={innerPanel(
											"flex h-14 items-center justify-start px-3 text-start gap-2",
										)}
									>
										<div aria-hidden className="*:size-8">
											{resource.icon}
										</div>
										<p>{resource.name}</p>
									</button>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</div>
	)
}
