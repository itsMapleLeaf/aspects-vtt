import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export function ActionRow(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(":flex-1 flex gap-1", props.className)}
		/>
	)
}

export function ActionRowItem({
	icon,
	children,
	...props
}: ComponentProps<"button"> & { icon: React.ReactNode }) {
	return (
		<button
			type="button"
			className={twMerge(
				"flex cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-primary-200 transition gap-1 hover:bg-primary-600",
				props.className,
			)}
		>
			{icon}
			<span className="text-xs/3 font-bold">{children}</span>
		</button>
	)
}
