import { AppHeader } from "./app-header.tsx"

export function HeaderLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col">
			<AppHeader />
			{children}
		</div>
	)
}
