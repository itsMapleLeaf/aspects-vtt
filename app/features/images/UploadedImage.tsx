import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import type { Nullish, Overwrite } from "#app/common/types.ts"
import { withMergedClassName } from "#app/ui/withMergedClassName.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { getApiImageUrl } from "./getApiImageUrl"

type UploadedImageProps = Overwrite<
	ComponentPropsWithoutRef<"div">,
	{
		id?: Nullish<Id<"_storage">>
		emptyIcon?: ReactNode
		imageClassName?: string
	}
>

export function UploadedImage({ id, emptyIcon, imageClassName, ...props }: UploadedImageProps) {
	const imageUrl = id ? getApiImageUrl(id) : undefined
	return (
		<div {...withMergedClassName(props, "flex items-center justify-center")}>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt=""
					className={twMerge("size-full object-contain", imageClassName)}
					draggable={false}
				/>
			) : (
				<div className="flex size-full flex-col p-2 text-primary-600 opacity-50 *:m-auto *:aspect-square *:size-full empty:hidden">
					{emptyIcon}
				</div>
			)}
		</div>
	)
}
