import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import type { Id } from "../../../convex/_generated/dataModel.js"
import type { Nullish, Overwrite } from "../../common/types.ts"
import { withMergedClassName } from "../../ui/withMergedClassName.ts"
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
					className={twMerge("size-full object-contain [will-change:transform]", imageClassName)}
					draggable={false}
				/>
			) : (
				<div className="flex-center size-full p-2 text-primary-600 opacity-50 *:size-full empty:hidden">
					{emptyIcon}
				</div>
			)}
		</div>
	)
}
