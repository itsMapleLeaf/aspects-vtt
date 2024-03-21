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
				"flex items-center justify-center p-4 data-[fill=parent]:size-full data-[fill=screen]:h-dvh",
				className,
			)}
		>
			<div
				className={twMerge(
					"grid aspect-square animate-spin grid-cols-2 grid-rows-2 gap-[12%] [animation-timing-function:ease]",
					size === "sm" && "size-6",
					size === "md" && "size-12",
				)}
			>
				<div className="aspect-square rounded-md bg-primary-700" />
				<div className="aspect-square rounded-md bg-primary-800" />
				<div className="aspect-square rounded-md bg-primary-800" />
				<div className="aspect-square rounded-md bg-primary-700" />
			</div>
		</div>
	)
}
