import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export function EmptyStatePanel({
	icon,
	message,
	actions,
}: {
	icon: ReactNode
	message: string
	actions?: React.ReactNode
}) {
	return (
		<div className="px-4 py-16">
			<div className="flex-center-col mx-auto w-full max-w-screen-sm rounded border border-primary-700 bg-black/10 p-6 gap-4">
				<div aria-hidden className="text-primary-500 opacity-60 *:size-16">
					{icon}
				</div>
				<p className="text-xl font-light">{message}</p>
				<div className="flex-center-row flex-wrap gap-2">{actions}</div>
			</div>
		</div>
	)
}

export function EmptyState({
	icon,
	message,
	actions,
	children,
	className,
}: {
	icon: ReactNode
	message: string
	actions?: React.ReactNode
	children?: React.ReactNode
	className?: string
}) {
	return (
		<section
			className={twMerge(
				"flex-center-col mx-auto w-full max-w-screen-sm text-center gap-2",
				className,
			)}
		>
			<div aria-hidden className="opacity-40 *:size-16 empty:hidden">
				{icon}
			</div>
			<p className="text-xl font-light opacity-75">{message}</p>
			<div className="flex-center-row flex-wrap gap-2 empty:hidden">
				{actions}
			</div>
			{children}
		</section>
	)
}
