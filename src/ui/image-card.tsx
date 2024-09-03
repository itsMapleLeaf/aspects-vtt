import { LucideImageOff } from "lucide-react"
import { ReactNode } from "react"
import { Heading } from "./heading.tsx"
import { mergeClassProp } from "./helpers.ts"

export function ImageCard({
	children,
	caption,
}: {
	children?: ReactNode
	caption?: ReactNode
}) {
	return (
		<div className="group cursor-default transition">
			{children}
			<Heading className="mt-1 text-center text-lg group-hover:text-accent-200">
				{caption}
			</Heading>
		</div>
	)
}

ImageCard.Image = ImageCardImage
function ImageCardImage(props: React.ComponentProps<"img">) {
	return (
		<img
			{...mergeClassProp(
				props,
				"aspect-video w-full rounded-md transition group-hover:brightness-110",
			)}
		/>
	)
}

ImageCard.Placeholder = ImageCardPlaceholder
function ImageCardPlaceholder({
	children = <LucideImageOff className="size-3/4 opacity-20" />,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			{...mergeClassProp(
				props,
				"bg-base-900 flex aspect-video w-full rounded-md transition *:m-auto group-hover:text-accent-200",
			)}
		>
			{children}
		</div>
	)
}
