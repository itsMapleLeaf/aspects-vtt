import { useQuery } from "convex/react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { StrictOmit } from "#app/common/types.ts"
import { clientEnv } from "#app/env.ts"
import { withMergedClassName } from "#app/ui/withMergedClassName.ts"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"

export function UploadedImage({
	imageId,
	fallback,
	...props
}: { imageId: Id<"images">; fallback?: ReactNode } & StrictOmit<
	ComponentPropsWithoutRef<"img">,
	"src"
>) {
	const convexUrl = new URL(clientEnv.VITE_CONVEX_URL)
	const convexSiteUrl = convexUrl.origin.replace(/cloud[\/]*$/, "site")
	const image = useQuery(api.images.get, { id: imageId })
	return (
		image?.storageId && (
			<img
				src={`${convexSiteUrl}/image?storageId=${image.storageId}`}
				{...withMergedClassName(props, "object-contain")}
				alt={props.alt ?? ""}
			/>
		)
	)
}
