import { twMerge } from "tailwind-merge"
import { AppHeader } from "./AppHeader.tsx"

export function AppHeaderLayout({
	className,
	children,
}: {
	className?: string
	children: React.ReactNode
}) {
	return (
		<div className={twMerge("grid content-start p-4 gap-4", className)}>
			<AppHeader />
			{children}
		</div>
	)
}
