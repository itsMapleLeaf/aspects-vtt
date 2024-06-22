import type { LoaderFunctionArgs } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"
import { unwrap } from "~/helpers/errors.ts"
import { AppHeader } from "../../ui/AppHeader.tsx"

export async function loader({ request }: LoaderFunctionArgs) {
	const caseSlugs = Object.keys(import.meta.glob("./*/_route.tsx")).map((path) =>
		unwrap(path.split("/")[1]),
	)
	return { caseSlugs }
}

export default function UiTests() {
	const { caseSlugs } = useLoaderData<typeof loader>()
	return (
		<div className="h-full gap-4 p-4">
			<AppHeader />
			<div className="flex gap-4">
				<nav className="flex w-[12rem] flex-col gap-2">
					{caseSlugs.map((slug) => (
						<Link key={slug} to={slug} className="text-primary-600 hover:underline">
							{slug}
						</Link>
					))}
				</nav>
				<div className="flex-1">
					<Outlet />
				</div>
			</div>
		</div>
	)
}
