import { To } from "@remix-run/router"
import { ComponentProps } from "react"
import { NavLink } from "react-router-dom"
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
	to,
	type = "button",
	...props
}: {
	icon: React.ReactNode
	className?: string
	children?: React.ReactNode
	onClick?: () => void
	type?: "button" | "submit"
	to?: To
}) {
	const className = twMerge(
		"flex cursor-default flex-col items-center justify-center rounded-md p-2 pb-1.5 text-primary-200 transition gap-1 hover:bg-primary-600",
		props.className,
	)

	return to ?
			<NavLink {...props} to={to} className={className}>
				{icon}
				<span className="text-xs/3 font-bold">{children}</span>
			</NavLink>
		:	<button {...props} type={type} className={className}>
				{icon}
				<span className="text-xs/3 font-bold">{children}</span>
			</button>
}
