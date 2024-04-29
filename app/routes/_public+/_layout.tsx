import { getAuth } from "@clerk/remix/ssr.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, redirect } from "@remix-run/react"
import { $path } from "remix-routes"
import { AppHeaderLayout } from "../../ui/AppHeaderLayout.tsx"

export async function loader(args: LoaderFunctionArgs) {
	const auth = await getAuth(args)
	if (auth.userId) {
		return redirect($path("/"))
	}
	return {}
}

export default function PublicRouteLayout() {
	return (
		<AppHeaderLayout className="flex min-h-screen flex-col">
			<div className="m-auto">
				<Outlet />
			</div>
		</AppHeaderLayout>
	)
}
