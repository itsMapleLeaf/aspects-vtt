import { Link, type LinkProps } from "@remix-run/react"
import type { ComponentPropsWithoutRef, ReactElement } from "react"
import type { Overwrite, StrictOmit } from "~/common/types"
import { withMergedClassName } from "./withMergedClassName"

export type ButtonProps = Overwrite<
	StrictOmit<ComponentPropsWithoutRef<"button"> | LinkProps, "children">,
	{
		text: string
		icon: ReactElement | undefined
	}
>

export function Button({ text, icon, ...props }: ButtonProps) {
	const content = (
		<>
			<span className="relative *:size-5 -mx-1 empty:hidden">{icon}</span>
			<span className="relative flex-1">{text}</span>
		</>
	)

	const className =
		"h-10 flex items-center gap-2 px-3 border border-primary-300 rounded bg-primary-300/30 relative before:absolute before:size-full before:inset-0 before:bg-primary-300/60 before:origin-bottom before:scale-y-0 before:transition hover:before:scale-y-100 transition active:before:bg-primary-300 hover:text-primary-700 translate-y-0 active:translate-y-0.5 active:duration-0 focus-visible:ring-2 ring-primary-400 focus:outline-none active:before:duration-0"

	return "to" in props ? (
		<Link {...withMergedClassName(props, className)}>{content}</Link>
	) : (
		<button type="button" {...withMergedClassName(props, className)}>
			{content}
		</button>
	)
}
