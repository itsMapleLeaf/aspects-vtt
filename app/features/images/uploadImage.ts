import type { ConvexReactClient } from "convex/react"
import { z } from "zod"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"

const uploadResultSchema = z.object({
	storageId: z.string().refine((_value): _value is Id<"_storage"> => true),
})

export async function uploadImage(file: File, convex: ConvexReactClient): Promise<Id<"_storage">> {
	const url = await convex.mutation(api.storage.functions.getUploadUrl)

	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": file.type },
		body: file,
	})

	const result = uploadResultSchema.parse(await response.json())
	return result.storageId
}
