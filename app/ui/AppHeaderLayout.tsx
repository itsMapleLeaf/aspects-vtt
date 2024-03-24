import { AppHeader } from "#app/ui/AppHeader.js"
import { twMerge } from "tailwind-merge"

export function AppHeaderLayout({
	className,
	children,
}: {
	className?: string
	children: React.ReactNode
}) {
	return (
		<div className={twMerge("grid content-start gap-4 p-4", className)}>
			<AppHeader />
			{children}
		</div>
	)
}
