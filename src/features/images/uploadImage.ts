import { Id } from "~/convex/_generated/dataModel"
import { AppError } from "~/lib/AppError.ts"
import { getConvexSiteUrl } from "~/lib/convex-url.ts"

export async function uploadImage(file: File) {
	const response = await fetch(
		new URL("/images", getConvexSiteUrl(import.meta.env.VITE_CONVEX_URL)),
		{
			method: "PUT",
			body: file,
			headers: { "Content-Type": file.type },
		},
	)

	if (!response.ok) {
		throw new AppError({
			userMessage: `Sorry, the upload failed. Try again?`,
			cause: response,
		})
	}

	const data = (await response.json()) as { storageId: Id<"_storage"> }
	return data.storageId
}
