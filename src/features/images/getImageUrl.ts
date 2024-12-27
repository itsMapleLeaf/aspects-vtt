import type { Id } from "~/convex/_generated/dataModel.js"
import { getConvexSiteUrl } from "~/lib/convex-url.ts"

export function getImageUrl(storageId: Id<"_storage">) {
	const url = new URL(
		"/images",
		getConvexSiteUrl(import.meta.env.VITE_CONVEX_URL),
	)
	url.searchParams.set("id", storageId)
	return url.href
}
