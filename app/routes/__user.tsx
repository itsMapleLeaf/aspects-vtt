import { getAuth } from "@clerk/remix/ssr.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, redirect } from "@remix-run/react"
import { $path } from "remix-routes"

export async function loader(args: LoaderFunctionArgs) {
	const auth = await getAuth(args)
	if (!auth.userId) {
		return redirect($path("/sign-in/*", { "*": "" }))
	}
	return {}
}

export default function UserRoute() {
	return <Outlet />
}
