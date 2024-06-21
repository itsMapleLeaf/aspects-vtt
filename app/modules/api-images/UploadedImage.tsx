import { LucideImageOff } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import type { Id } from "../../../convex/_generated/dataModel.js"
import type { Nullish, Overwrite } from "../../helpers/types.ts"
import { getApiImageUrl } from "./helpers.ts"

type UploadedImageProps = Overwrite<
	ComponentProps<"div">,
	{
		id?: Nullish<Id<"_storage">>
		fallbackUrl?: string
		fallbackIcon?: ReactNode
		className?: string | { container?: string; image?: string; icon?: string }
	}
>

export function UploadedImage({
	id,
	fallbackUrl,
	fallbackIcon: emptyIcon = <LucideImageOff />,
	className,
	...props
}: UploadedImageProps) {
	const imageUrl = id ? getApiImageUrl(id) : fallbackUrl
	const resolvedClassName = typeof className === "string" ? { container: className } : className
	return (
		<div
			{...props}
			className={twMerge("flex items-center justify-center", resolvedClassName?.container)}
		>
			{imageUrl ?
				<img
					src={imageUrl}
					alt=""
					className={twMerge(
						// will-change-transform keeps the image from looking super grainy with certain other classes
						"size-full object-contain will-change-transform",
						resolvedClassName?.image,
					)}
					draggable={false}
				/>
			:	<div
					className={twMerge(
						"flex-center size-full text-primary-600 opacity-50 *:aspect-square *:w-3/4 *:min-w-16 empty:hidden",
						resolvedClassName?.icon,
					)}
				>
					{emptyIcon}
				</div>
			}
		</div>
	)
}
