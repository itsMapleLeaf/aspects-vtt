import React from "react"
import { twMerge } from "tailwind-merge"
import { mergeClassProp } from "./helpers.ts"
import { Loading } from "./loading.tsx"

export interface ButtonProps extends React.ComponentProps<"button"> {
	appearance?: keyof typeof styles.appearance
	pending?: boolean
	icon?: React.ReactElement
	element?: React.ReactElement
}

export function Button({
	appearance = "solid",
	pending,
	icon: iconProp,
	element = <button type="button" />,
	children,
	...props
}: ButtonProps) {
	const icon = pending ? <Loading /> : iconProp

	return React.cloneElement(
		element,
		mergeClassProp(
			{
				disabled: pending,
				...element.props,
				...props,
			},
			"border border-transparent",
			"rounded",
			"text-base/none font-medium",
			"transition active:duration-0",
			"will-change-transform active:[&:not(:disabled)]:scale-95",
			"disabled:opacity-75 disabled:cursor-not-allowed",
			"flex items-center gap-3 justify-center",
			icon && !children ? "size-10" : "h-10 px-3",
			styles.appearance[appearance],
		),
		icon &&
			React.cloneElement(
				icon,
				mergeClassProp(icon.props, "size-5 flex-shrink-0"),
			),
		children,
	)
}

const styles = {
	appearance: {
		solid: twMerge(`
			bg-stone-800 hover:[&:not(:disabled)]:bg-stone-900 active:[&:not(:disabled)]:bg-stone-700
			border-stone-700 hover:[&:not(:disabled)]:border-stone-600
		`),
		clear: twMerge(`
			bg-transparent hover:[&:not(:disabled)]:bg-stone-800 active:[&:not(:disabled)]:bg-stone-700
			hover:[&:not(:disabled)]:border-stone-800 active:[&:not(:disabled)]:border-stone-700
		`),
	},
}
