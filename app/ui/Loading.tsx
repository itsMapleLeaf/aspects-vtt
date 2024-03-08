import { twMerge } from "tailwind-merge"

export function Loading({ size = "md" }: { size?: "sm" | "md" }) {
	return (
		<div
			className={twMerge(
				"grid animate-spin grid-cols-2 grid-rows-2 gap-[12%] [animation-timing-function:ease]",
				size === "sm" && "size-6",
				size === "md" && "size-12",
			)}
		>
			<div className="aspect-square rounded-md bg-primary-700" />
			<div className="aspect-square rounded-md bg-primary-800" />
			<div className="aspect-square rounded-md bg-primary-800" />
			<div className="aspect-square rounded-md bg-primary-700" />
		</div>
	)
}
