import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { Nullish, Overwrite } from "#app/common/types.ts"
import { withMergedClassName } from "#app/ui/withMergedClassName.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { getApiImageUrl } from "./getApiImageUrl"

type UploadedImageProps = Overwrite<
	ComponentPropsWithoutRef<"div">,
	{
		id?: Nullish<Id<"_storage">>
		emptyIcon?: ReactNode
	}
>

export function UploadedImage({ id, emptyIcon, ...props }: UploadedImageProps) {
	const imageUrl = id ? getApiImageUrl(id) : undefined
	return (
		<div {...withMergedClassName(props, "flex items-center justify-center")}>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt=""
					className="size-auto max-h-full max-w-full rounded object-contain"
					draggable={false}
				/>
			) : (
				<div className="flex size-full flex-col text-primary-600 opacity-50 *:m-auto *:aspect-square *:size-full *:max-h-24 *:max-w-24 empty:hidden">
					{emptyIcon}
				</div>
			)}
		</div>
	)
}
