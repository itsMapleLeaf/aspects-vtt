import type { Id } from "../../../convex/_generated/dataModel.js"
import { clientEnv } from "../../env.ts"

export function getApiImageUrl(id: Id<"_storage">) {
	const url = new URL("/image", clientEnv.VITE_CONVEX_URL.replace(/\.cloud[\/]*$/, ".site"))
	url.searchParams.set("id", id)
	return url.href
}
