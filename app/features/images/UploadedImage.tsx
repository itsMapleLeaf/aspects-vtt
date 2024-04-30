import type { ComponentProps, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import type { Id } from "../../../convex/_generated/dataModel.js"
import type { Nullish, Overwrite } from "../../common/types.ts"
import { getApiImageUrl } from "./getApiImageUrl"

type UploadedImageProps = Overwrite<
	ComponentProps<"div">,
	{
		id?: Nullish<Id<"_storage">>
		emptyIcon?: ReactNode
		className?: string | { container?: string; image?: string }
	}
>

export function UploadedImage({ id, emptyIcon, className, ...props }: UploadedImageProps) {
	const imageUrl = id ? getApiImageUrl(id) : undefined
	const resolvedClassName = typeof className === "string" ? { container: className } : className
	return (
		<div
			{...props}
			className={twMerge("flex items-center justify-center", resolvedClassName?.container)}
		>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt=""
					className={twMerge(
						"size-full object-contain [will-change:transform]",
						resolvedClassName?.image,
					)}
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
