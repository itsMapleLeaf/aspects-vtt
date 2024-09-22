import type { Id } from "~/convex/_generated/dataModel.js"

export function getImageUrl(storageId: Id<"_storage">) {
	const url = new URL("/images", import.meta.env.VITE_CONVEX_API_URL)
	url.searchParams.set("id", storageId)
	return url.href
}
