import { useQuery } from "convex/react"
import { LucideImageOff } from "lucide-react"
import type { ComponentProps, ReactElement } from "react"
import type { Nullish } from "~/helpers/types.ts"
import { Loading } from "~/ui/Loading.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"

export function ApiImage({
	imageId,
	fallback = <LucideImageOff />,
	...props
}: { imageId: Nullish<Id<"images">>; fallback?: ReactElement } & ComponentProps<"div">) {
	const url = useQuery(api.images.getBestUrl, imageId ? { id: imageId } : "skip")
	return (
		<div {...withMergedClassName(props, "*:size-full")}>
			{url === undefined ?
				<Loading />
			: url === null ?
				fallback
			:	<img src={url} alt="" />}
		</div>
	)
}
