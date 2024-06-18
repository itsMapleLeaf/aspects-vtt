import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { Suspense } from "react"
import { AppHeader } from "../../ui/AppHeader.tsx"
import { Loading } from "../../ui/Loading.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import "./markdown.css"

export async function loader() {
	const pages = import.meta.glob<string>("./_pages/**/*.mdx", {
		eager: true,
		import: "title",
	})

	const links = Object.entries(pages).map(([id, title]) => {
		const location = id
			.replace(new RegExp(String.raw`^\./_pages/`), "")
			.replace(/\.mdx$/, "")
			.split(/[/\\.]/)
			.filter((part) => !part.startsWith("_") && part !== "index")
			.join("/")

		return { title, location, end: location === "" ? true : undefined }
	})

	return { links }
}

export default function GuideLayout() {
	return (
		<>
			<style>{`
				:root {
					scrollbar-gutter: stable;
				}
			`}</style>

			<div className="sticky inset-x-0 top-0 z-10 p-4">
				<AppHeader />
			</div>

			<div className="mx-auto max-w-screen-lg gap-4 p-4 [--sidebar-width:theme(spacing.56)]">
				<div className="fixed h-[calc(100dvh-theme(spacing.24))] w-[--sidebar-width]">
					<ScrollArea>
						<GuideNav />
					</ScrollArea>
				</div>
				<Suspense fallback={<Loading />}>
					<main className="ml-[--sidebar-width] min-w-0 flex-1 pl-2">
						<Outlet />
					</main>
				</Suspense>
			</div>
		</>
	)
}

function GuideNav() {
	const { links } = useLoaderData<typeof loader>()
	return (
		<nav className="flex flex-col">
			{links.map((link) => (
				<NavLink
					key={link.location}
					to={link.location}
					end={link.end}
					prefetch="intent"
					className="block rounded-lg px-3 py-2 opacity-75 transition-opacity hover:opacity-100 aria-[current=page]:bg-primary-200 aria-[current=page]:opacity-100"
				>
					{link.title}
				</NavLink>
			))}
		</nav>
	)
}
