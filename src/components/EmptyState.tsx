import React, { ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { secondaryHeading } from "~/styles/text.ts"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
	text: string
	icon: ReactNode
}

export function EmptyState({
	text,
	icon,
	className,
	...props
}: EmptyStateProps) {
	return (
		<div
			{...props}
			className={twMerge(
				"flex flex-col items-center justify-center gap",
				className,
			)}
		>
			<div className="text-primary-500 *:size-16 *:stroke-1">{icon}</div>
			<p className={secondaryHeading("opacity-60")}>{text}</p>
		</div>
	)
}
