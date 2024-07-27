import { useQuery } from "convex/react"
import { LucideImageOff } from "lucide-react"
import { type ComponentProps, type ReactElement, useRef } from "react"
import { twMerge } from "tailwind-merge"
import { useSize } from "~/helpers/dom/useResizeObserver.ts"
import type { Nullish } from "~/helpers/types.ts"
import { Loading } from "~/ui/Loading.tsx"
import { type ClassSlotProps, resolveClasses } from "~/ui/classSlots.tsx"
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
	const ref = useRef<HTMLDivElement>(null)
	const size = useSize(ref)
	const url = useQuery(
		api.images.getBestUrl,
		imageId ? { id: imageId, width: size.x, height: size.y } : "skip",
	)
	const classes = resolveClasses(className, "wrapper")
	return (
		<div {...props} className={twMerge("*:size-full", classes.wrapper)} ref={ref}>
			{imageId != null && url === undefined ?
				<Loading />
			: url == null ?
				fallback
			:	<img src={url} alt="" className={classes.image} />}
		</div>
	)
}
