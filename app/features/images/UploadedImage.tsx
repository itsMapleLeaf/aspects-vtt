import { LucideFileX, LucideImage } from "lucide-react"
import { type ComponentPropsWithoutRef, type ReactNode, useEffect, useState } from "react"
import type { Nullish, Overwrite } from "#app/common/types.ts"
import { clientEnv } from "#app/env.ts"
import { Loading } from "#app/ui/Loading.js"
import { withMergedClassName } from "#app/ui/withMergedClassName.js"
import type { Id } from "#convex/_generated/dataModel.js"

type UploadedImageProps = Overwrite<
	ComponentPropsWithoutRef<"div">,
	{
		id?: Nullish<Id<"_storage">>
		emptyIcon?: ReactNode
	}
>

export function UploadedImage(props: UploadedImageProps) {
	return <UploadedImageInternal {...props} key={props.id} />
}

function UploadedImageInternal({ id, emptyIcon = <LucideImage />, ...props }: UploadedImageProps) {
	const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")
	const imageUrl = id && getImageUrl(id)

	if (typeof window !== "undefined" && status === "loading" && imageUrl) {
		const image = new Image()
		image.src = imageUrl
		if (image.complete) {
			setStatus("loaded")
		}
	}

	useEffect(() => {
		if (status === "loading" && imageUrl) {
			const image = new Image()
			image.src = imageUrl
			image.onload = () => setStatus("loaded")
			image.onerror = () => setStatus("error")
			return () => {
				image.onload = null
				image.onerror = null
			}
		}
	}, [imageUrl, status])

	return (
		<div
			{...withMergedClassName(
				props,
				"bg-contain bg-center bg-no-repeat flex items-center justify-center",
			)}
			style={{ ...props.style, backgroundImage: imageUrl ? `url(${imageUrl})` : undefined }}
			data-status={imageUrl ? status : undefined}
		>
			<div className="flex size-full flex-col text-primary-600 opacity-50 *:m-auto empty:hidden *:aspect-square *:size-full *:max-h-24 *:max-w-24">
				{status === "error" && <LucideFileX />}
				{imageUrl ? null : emptyIcon}
			</div>
			<Loading
				data-visible={imageUrl && status === "loading"}
				className="absolute opacity-0 transition data-[visible=true]:opacity-100"
			/>
		</div>
	)
}

function getImageUrl(id: Id<"_storage">) {
	const url = new URL("/image", clientEnv.VITE_CONVEX_URL.replace(/\.cloud[\/]*$/, ".site"))
	url.searchParams.set("id", id)
	return url.href
}
