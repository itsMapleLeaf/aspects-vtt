import type { LoaderFunctionArgs } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"
import { AppHeader } from "~/ui/AppHeader.tsx"
import { titleCase } from "../../../common/string.ts"
import { getTestCaseSlugs } from "./test-cases.ts"

export async function loader({ request }: LoaderFunctionArgs) {
	const caseSlugs = getTestCaseSlugs()
	return { caseSlugs }
}

export default function UiTests() {
	const { caseSlugs } = useLoaderData<typeof loader>()
	return (
		<div className="h-full p-4 gap-4">
			<AppHeader />
			<div className="flex gap-4">
				<nav className="flex w-[12rem] flex-col gap-2">
					{caseSlugs.map((slug) => (
						<Link
							key={slug}
							to={slug}
							className="text-primary-600 hover:underline"
						>
							{titleCase(slug)}
						</Link>
					))}
				</nav>
				<div className="grid flex-1 gap-4">
					<Outlet />
				</div>
			</div>
		</div>
	)
}
