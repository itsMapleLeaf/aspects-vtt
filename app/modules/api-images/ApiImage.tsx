import { useQuery } from "convex/react"
import { LucideImageOff } from "lucide-react"
import type { ComponentProps, ReactElement } from "react"
import { twMerge } from "tailwind-merge"
import type { Nullish } from "~/helpers/types.ts"
import { type ClassSlotProps, resolveClasses } from "~/ui/classSlots.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"

export interface ApiImageProps extends ClassSlotProps<"wrapper" | "image", ComponentProps<"div">> {
	imageId: Nullish<Id<"images">>
	fallback?: ReactElement
}

export function ApiImage({
	imageId,
	fallback = <LucideImageOff />,
	className,
	...props
}: ApiImageProps) {
	const url = useQuery(api.images.getBestUrl, imageId ? { id: imageId } : "skip")
	const classes = resolveClasses(className, "wrapper")
	return (
		<div {...props} className={twMerge("*:size-full", classes.wrapper)}>
			{imageId != null && url === undefined ?
				<Loading />
			: url == null ?
				fallback
			:	<img src={url} alt="" className={classes.image} />}
		</div>
	)
}
