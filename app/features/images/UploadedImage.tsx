import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { StrictOmit } from "#app/common/types.ts"
import { clientEnv } from "#app/env.ts"
import { withMergedClassName } from "#app/ui/withMergedClassName.ts"
import type { Id } from "#convex/_generated/dataModel.js"

function getImageUrl(id: Id<"_storage">) {
	const url = new URL("/image", clientEnv.VITE_CONVEX_URL.replace(/\.cloud[\/]*$/, ".site"))
	url.searchParams.set("id", id)
	return url
}

export function UploadedImage({
		id,
		fallback,
		...props
	}: { id: Id<"_storage">; fallback?: ReactNode } & StrictOmit<
		ComponentPropsWithoutRef<"img">,
		"src"
	>) {
		return (
			<img
				src={getImageUrl(id).href}
				{...withMergedClassName(props, "object-contain")}
				alt={props.alt ?? ""}
			/>
		)
	}
