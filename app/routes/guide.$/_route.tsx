import { Link, NavLink, useParams } from "@remix-run/react"
import type { MDXComponents, MDXModule } from "mdx/types"
import { Suspense, use } from "react"
import { $params } from "remix-routes"
import { AppHeader } from "../../ui/AppHeader.tsx"
import { Loading } from "../../ui/Loading.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import "./markdown.css"
import { getPage, getPageLinks, normalizePageLink } from "./pages.ts"

export default function GuideRoute() {
	const { "*": path } = $params("/guide/*", useParams())
	const page = getPage(path)
	const module = page?.load()
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
						{module ?
							<PageContent module={module} />
						:	<p>Page not found</p>}
					</main>
				</Suspense>
			</div>
		</>
	)
}

function PageContent({ module }: { module: Promise<MDXModule> }) {
	const Content = use(module).default
	return (
		<div className="markdown rounded-lg bg-primary-200 p-4">
			<Content components={mdxComponents} />
		</div>
	)
}

const mdxComponents: MDXComponents = {
	a: ({ href, children }) => (
		<Link to={normalizePageLink(href)} className="text-primary-900 underline hover:no-underline">
			{children}
		</Link>
	),
}
