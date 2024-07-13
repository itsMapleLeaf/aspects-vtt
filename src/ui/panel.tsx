import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export function Panel(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"rounded border border-base-700 bg-base-900 shadow",
				props.className,
			)}
		/>
	)
}
