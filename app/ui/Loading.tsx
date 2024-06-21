import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export function Loading({
	size = "md",
	fill,
	className,
}: {
	size?: "sm" | "md"
	fill?: "parent" | "screen"
	className?: string
}) {
	return (
		<div
			data-fill={fill}
			className={twMerge(
				"flex items-center justify-center data-[fill=parent]:size-full data-[fill=screen]:h-dvh",
				className,
			)}
		>
			<LoadingIcon className={twMerge(size === "sm" && "w-6", size === "md" && "w-12")} />
		</div>
	)
}

export function LoadingIcon(props: ComponentProps<"div">) {
	return (
		<div
			className={twMerge(
				"grid aspect-square w-full animate-spin grid-cols-2 grid-rows-2 gap-[12%] [animation-timing-function:ease]",
				props.className,
			)}
		>
			<div className="aspect-square rounded-md bg-primary-700" />
			<div className="aspect-square rounded-md bg-primary-800" />
			<div className="aspect-square rounded-md bg-primary-800" />
			<div className="aspect-square rounded-md bg-primary-700" />
		</div>
	)
}
