import React from "react"
import { twMerge } from "tailwind-merge"
import { mergeClassProp } from "./helpers.ts"
import { Loading } from "./loading.tsx"
import { Slot, SlotProps } from "./slot.tsx"

export interface ButtonProps extends SlotProps {
	icon: React.ReactNode
	appearance?: keyof typeof styles.appearance
	pending?: boolean
	disabled?: boolean
	type?: "button" | "submit"
}

export function Button({
	appearance = "solid",
	pending,
	icon: iconProp,
	element,
	type = "button",
	disabled,
	children,
	...props
}: ButtonProps) {
	const icon = pending ? <Loading /> : iconProp

	const buttonClass = twMerge(
		"flex items-center justify-center gap-3",
		"border border-transparent",
		"rounded",
		"text-base/none font-medium",
		"transition active:duration-0",
		"will-change-transform active:[&:not(:disabled)]:scale-95",
		"disabled:cursor-not-allowed disabled:opacity-75",
		icon && !children ? "size-10" : "h-10 px-3",
		styles.appearance[appearance],
	)

	return (
		<Slot
			{...mergeClassProp(props, buttonClass)}
			element={element ?? <button type={type} disabled={pending ?? disabled} />}
		>
			{icon && <Slot element={icon} className="size-5 flex-shrink-0" />}
			{children}
		</Slot>
	)
}

const styles = {
	appearance: {
		solid: twMerge(
			`border-stone-700 bg-stone-800 hover:[&:not(:disabled)]:border-stone-600 hover:[&:not(:disabled)]:bg-stone-900 active:[&:not(:disabled)]:bg-stone-700`,
		),
		clear: twMerge(
			`bg-transparent hover:[&:not(:disabled)]:border-stone-800 hover:[&:not(:disabled)]:bg-stone-800 active:[&:not(:disabled)]:border-stone-700 active:[&:not(:disabled)]:bg-stone-700`,
		),
	},
}
