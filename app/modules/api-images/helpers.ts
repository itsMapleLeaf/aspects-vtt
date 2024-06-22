import { $path } from "remix-routes"
import type { Id } from "../../../convex/_generated/dataModel.js"

export function getApiImageUrl(id: Id<"_storage">) {
	return $path("/images/:id", { id })
}
