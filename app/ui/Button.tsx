import { Link, type LinkProps } from "@remix-run/react"
import type { ComponentPropsWithoutRef, ReactElement } from "react"
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
			<span
				data-size={size}
				className="relative *:data-[size=md]:size-5 *:data-[size=lg]:size-8 -mx-1 empty:hidden"
			>
				{icon}
			</span>
			<span data-size={size} className="relative flex-1 empty:hidden">
				{text}
			</span>
		</>
	)

	const className =
		"h-10 data-[size=lg]:h-12 flex items-center gap-2 px-3 border border-primary-300 rounded bg-primary-300/30 relative before:absolute before:size-full before:inset-0 before:bg-primary-300/60 before:origin-bottom before:scale-y-0 before:transition hover:before:scale-y-100 transition active:before:bg-primary-300 hover:text-primary-700 translate-y-0 active:translate-y-0.5 active:duration-0 focus-visible:ring-2 ring-primary-400 focus:outline-none active:before:duration-0"

	return "to" in props ? (
		<Link data-size={size} {...withMergedClassName(props, className)}>
			{content}
		</Link>
	) : (
		<button
			type="button"
			data-size={size}
			{...withMergedClassName(props, className)}
		>
			{content}
		</button>
	)
}
