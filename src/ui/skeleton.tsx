import { ComponentProps } from "react"
import { mergeClassProp } from "./helpers.ts"

export function SkeletonGrid({
	count,
	...props
}: { count: number } & ComponentProps<"div">) {
	return (
		<div {...mergeClassProp(props, "grid grid-cols-3 gap-3")}>
			{Array.from({ length: count }).map((_, index) => (
				<SkeletonCard key={index} />
			))}
		</div>
	)
}

export function SkeletonCard(props: ComponentProps<"div">) {
	return (
		<div
			{...mergeClassProp(
				props,
				"aspect-[4/3] w-full animate-pulse rounded-lg bg-base-800/70",
			)}
		></div>
	)
}
