import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { Suspense } from "react"
import banner from "~/assets/banner.webp"
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
					overflow-x: clip;
				}
			`}</style>

			<div className="fixed inset-x-0 top-0 z-10 h-32 p-4 bg-natural-gradient-100">
				<AppHeader />
			</div>

			<div className="relative w-full">
				<img
					src={banner}
					alt=""
					draggable={false}
					className="aspect-[4/1] w-full object-cover object-[50%,25%]"
				/>
				<div className="absolute inset-x-0 bottom-0 h-24 translate-y-px -scale-y-100 bg-natural-gradient-100"></div>
			</div>

			<div className="mx-auto flex max-w-screen-lg gap-2 p-4">
				<div className="sticky top-16 h-fit w-56">
					<ScrollArea>
						<GuideNav />
					</ScrollArea>
				</div>
				<Suspense fallback={<Loading />}>
					<main className="min-w-0 flex-1">
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
