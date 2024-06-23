import type { LoaderFunctionArgs } from "@remix-run/node"
import { $params } from "remix-routes"
import { clientEnv } from "~/env.ts"

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { id } = $params("/images/:id", params)
	const url = new URL("/image", clientEnv.VITE_CONVEX_URL.replace(/\.cloud\/*$/, ".site"))
	url.searchParams.set("id", id)
	const response = await fetch(url.href, request)
	response.headers.set("Cache-Control", "public, max-age=31536000")
	return response
}
