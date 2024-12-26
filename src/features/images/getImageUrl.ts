import type { Id } from "~/convex/_generated/dataModel.js"

const convexSiteUrl = import.meta.env.VITE_CONVEX_URL.replace(
	/\.cloud$/,
	".site",
)

export function getImageUrl(storageId: Id<"_storage">) {
	const url = new URL("/images", convexSiteUrl)
	url.searchParams.set("id", storageId)
	return url.href
}
