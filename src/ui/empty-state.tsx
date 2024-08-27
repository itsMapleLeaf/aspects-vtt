import React from "react"
import { Heading, HeadingLevel } from "./heading.js"
import { Slot } from "./slot.js"

export function EmptyState({
	title,
	icon,
	children,
}: {
	title: string
	icon: React.ReactNode
	children?: React.ReactNode
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-16">
			<Slot element={icon} className="size-24 opacity-25" />
			<HeadingLevel>
				<Heading className="text-center text-2xl opacity-50">{title}</Heading>
				{children}
			</HeadingLevel>
		</div>
	)
}
