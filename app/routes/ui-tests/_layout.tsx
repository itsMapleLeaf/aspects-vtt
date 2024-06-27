import type { LoaderFunctionArgs } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"
import { AppHeader } from "../../ui/AppHeader.tsx"
import { getTestCaseSlugs } from "./helpers.ts"

export async function loader({ request }: LoaderFunctionArgs) {
	const caseSlugs = getTestCaseSlugs()
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
