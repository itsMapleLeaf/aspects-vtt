import { NavLink, Outlet } from "@remix-run/react"
import { Suspense } from "react"
import { AppHeader } from "../../ui/AppHeader.tsx"
import { Loading } from "../../ui/Loading.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import "./markdown.css"
import { getPageLinks } from "./pages.ts"

export default function GuideLayout() {
	return (
		<>
			<title>Player Guide | Aspects VTT</title>

			<style>{`
				:root {
					scrollbar-gutter: stable;
				}
			`}</style>

			<div className="sticky inset-x-0 top-0 z-10 p-4">
				<AppHeader />
			</div>

			<div className="mx-auto max-w-screen-lg gap-4 p-4 [--sidebar-width:theme(spacing.56)]">
				<nav className="fixed h-[calc(100dvh-theme(spacing.24))] w-[--sidebar-width]">
					<ScrollArea>
						<div className="flex flex-col">
							{getPageLinks().map((page) => (
								<NavLink
									key={page.id}
									to={page.route}
									className="block px-3 py-1.5 opacity-75 transition-opacity hover:opacity-100"
								>
									{page.title}
								</NavLink>
							))}
						</div>
					</ScrollArea>
				</nav>
				<Suspense fallback={<Loading />}>
					<main className="ml-[--sidebar-width] min-w-0 flex-1 pl-2">
						<Outlet />
					</main>
				</Suspense>
			</div>
		</>
	)
}
