import type { ReactNode } from "react"

export function EmptyState({
	icon,
	message,
	actions,
}: {
	icon: ReactNode
	message: string
	actions: React.ReactNode
}) {
	return (
		<div className="px-4 py-16">
			<section className="flex-center-col mx-auto w-full max-w-screen-sm gap-4 rounded border border-primary-300 bg-black/10 p-6">
				<div aria-hidden className="text-primary-500 opacity-60 *:size-16">
					{icon}
				</div>
				<p className="text-xl font-light">{message}</p>
				<div className="flex-center-row flex-wrap gap-2">{actions}</div>
			</section>
		</div>
	)
}
