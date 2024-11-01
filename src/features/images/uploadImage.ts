import { Id } from "~/convex/_generated/dataModel"
import { AppError } from "~/lib/AppError.ts"

export async function uploadImage(file: File) {
	const response = await fetch(
		new URL("/images", import.meta.env.VITE_CONVEX_API_URL),
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
