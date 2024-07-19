import React, { startTransition } from "react"
import { useFormStatus } from "react-dom"
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
	align?: "start" | "center" | "end"
}

export function Button({
	appearance = "solid",
	pending: pendingProp,
	icon: iconProp,
	element,
	type = "button",
	disabled,
	children,
	align = "center",
	...props
}: ButtonProps) {
	const status = useFormStatus()

	const pending = pendingProp ?? status.pending
	const icon = pending ? <Loading /> : iconProp

	const buttonClass = twMerge(
		"flex items-center gap-2.5",
		"border border-transparent",
		"rounded",
		"text-base font-medium",
		"transition active:duration-0",
		"will-change-transform active:[&:not(:disabled)]:scale-95",
		"disabled:cursor-not-allowed disabled:opacity-75",
		align === "start" && "justify-start",
		align === "center" && "justify-center",
		align === "end" && "justify-end",
		icon && !children ? "size-10" : "h-10 px-2.5",
		styles.appearance[appearance],
	)

	return (
		<Slot
			{...mergeClassProp(props, buttonClass)}
			element={element ?? <button type={type} disabled={pending ?? disabled} />}
			onClick={(event) => {
				startTransition(() => {
					props.onClick?.(event)
				})
			}}
		>
			{icon && <Slot element={icon} className="size-5 flex-shrink-0" />}
			{children}
		</Slot>
	)
}

const styles = {
	appearance: {
		solid: twMerge(
			`border-base-700 bg-base-800 hover:[&:not(:disabled)]:border-base-600 hover:[&:not(:disabled)]:bg-base-900 active:[&:not(:disabled)]:bg-base-700`,
		),
		clear: twMerge(
			`bg-transparent hover:[&:not(:disabled)]:border-base-800 hover:[&:not(:disabled)]:bg-base-800 active:[&:not(:disabled)]:border-base-700 active:[&:not(:disabled)]:bg-base-700`,
		),
	},
}
