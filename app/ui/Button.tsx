import { Link, type LinkProps } from "@remix-run/react"
import type { ComponentPropsWithoutRef, ReactElement } from "react"
import { twMerge } from "tailwind-merge"
import type { Overwrite, StrictOmit } from "~/common/types"
import { withMergedClassName } from "./withMergedClassName"

export type ButtonProps = Overwrite<
	StrictOmit<ComponentPropsWithoutRef<"button"> | LinkProps, "children">,
	{
		icon: ReactElement | undefined
		text?: string
		size?: "md" | "lg"
	}
>

export function Button({ text, icon, size = "md", ...props }: ButtonProps) {
	const content = (
		<>
			<span data-size={size} className="relative -mx-1 size-5 empty:hidden *:data-[size=lg]:size-8">
				{icon}
			</span>
			<span data-size={size} className="relative flex-1 empty:hidden">
				{text}
			</span>
		</>
	)

	const className = twMerge(
		"flex items-center gap-2",
		"h-10 data-[size=lg]:h-12",
		"px-3",
		"rounded border border-primary-300",
		"ring-primary-400 focus:outline-none focus-visible:ring-2",

		"relative before:absolute before:inset-0 before:size-full",

		"transition active:duration-0",
		"before:transition active:before:duration-0",

		"bg-primary-300/30",
		"before:bg-primary-300/60 hover:text-primary-700 active:before:bg-primary-300",

		"translate-y-0 active:translate-y-0.5",
		"before:origin-bottom before:scale-y-0 hover:before:scale-y-100",
	)

	return "to" in props ?
			<Link data-size={size} {...withMergedClassName(props, className)}>
				{content}
			</Link>
		:	<button type="button" data-size={size} {...withMergedClassName(props, className)}>
				{content}
			</button>
}
