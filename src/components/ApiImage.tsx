import { LucideImageOff, LucideXCircle } from "lucide-react"
import { ComponentProps, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { Except } from "type-fest"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { Id } from "~/convex/_generated/dataModel.js"
import { getImageUrl } from "~/features/images/getImageUrl.ts"

export interface ApiImageProps extends ComponentProps<"img"> {
	imageId: Id<"_storage"> | null | undefined
}

export function ApiImage({ imageId, className, ...props }: ApiImageProps) {
	return (
		imageId && (
			<img
				src={getImageUrl(imageId)}
				alt=""
				className={twMerge(className)}
				{...props}
			/>
		)
	)
}

export interface StatefulApiImageProps
	extends Except<ComponentProps<"div">, "className"> {
	imageId: Id<"_storage"> | null | undefined
	className?: string | { root?: string; image?: string; icon?: string }
}

export function StatefulApiImage({
	imageId,
	className,
	...props
}: StatefulApiImageProps) {
	const [status, setStatus] = useState<"loading" | "loaded" | "error">(
		"loading",
	)

	useEffect(() => {
		if (!imageId) {
			setStatus("loading")
			return
		}

		const image = new Image()
		image.src = getImageUrl(imageId)

		if (image.complete) {
			setStatus("loaded")
			return
		}

		const controller = new AbortController()
		image.addEventListener("load", () => setStatus("loaded"), {
			signal: controller.signal,
		})
		image.addEventListener("error", () => setStatus("error"), {
			signal: controller.signal,
		})
		return () => controller.abort()
	}, [imageId])

	const classes =
		typeof className === "string" ? { root: className } : (className ?? {})

	return (
		<div {...props} className={twMerge("w-fit", classes.root)}>
			{imageId == null ? (
				<LucideImageOff className={twMerge(classes.icon)} />
			) : status === "loading" ? (
				<LoadingIcon className={twMerge(classes.icon)} />
			) : status === "error" ? (
				<LucideXCircle className={twMerge(classes.icon)} />
			) : (
				<ApiImage imageId={imageId} className={twMerge(classes.image)} />
			)}
		</div>
	)
}
