import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { Nullish, Overwrite } from "#app/common/types.ts"
import { clientEnv } from "#app/env.ts"
import { withMergedClassName } from "#app/ui/withMergedClassName.js"
import type { Id } from "#convex/_generated/dataModel.js"

type UploadedImageProps = Overwrite<
	ComponentPropsWithoutRef<"div">,
	{
		id?: Nullish<Id<"_storage">>
		emptyIcon?: ReactNode
	}
>

export function UploadedImage({ id, emptyIcon, ...props }: UploadedImageProps) {
	const imageUrl = id ? getImageUrl(id) : undefined
	return (
		<div
			{...withMergedClassName(
				props,
				"flex items-center justify-center bg-contain bg-center bg-no-repeat",
			)}
		>
			{imageUrl ?
				<img
					src={imageUrl}
					alt=""
					className="size-auto max-h-full max-w-full rounded object-contain"
					draggable={false}
				/>
			:	<div className="flex size-full flex-col text-primary-600 opacity-50 *:m-auto *:aspect-square *:size-full *:max-h-24 *:max-w-24 empty:hidden">
					{emptyIcon}
				</div>
			}
		</div>
	)
}

function getImageUrl(id: Id<"_storage">) {
	const url = new URL("/image", clientEnv.VITE_CONVEX_URL.replace(/\.cloud[\/]*$/, ".site"))
	url.searchParams.set("id", id)
	return url.href
}
