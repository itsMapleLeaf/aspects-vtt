import { clientEnv } from "#app/env.ts"
import type { Id } from "#convex/_generated/dataModel.js"

export function getApiImageUrl(id: Id<"_storage">) {
	const url = new URL("/image", clientEnv.VITE_CONVEX_URL.replace(/\.cloud[\/]*$/, ".site"))
	url.searchParams.set("id", id)
	return url.href
}
