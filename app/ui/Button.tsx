import React, {
	type ComponentProps,
	type Key,
	type ReactElement,
	type ReactNode,
	cloneElement,
	useTransition,
} from "react"
import { useFormStatus } from "react-dom"
import { twMerge } from "tailwind-merge"
import { usePendingDelay } from "~/helpers/react/hooks.ts"
import type { Disallowed, StrictOmit } from "../helpers/types.ts"
import { Loading } from "./Loading.tsx"
import { Tooltip, type TooltipProps } from "./Tooltip.tsx"
import { panel } from "./styles.ts"
import { withMergedClassName } from "./withMergedClassName"

interface ButtonPropsBase {
	icon: ReactNode
	/** @deprecated Use `children` instead */
	text?: ReactNode
	tooltip?: ReactNode
	tooltipPlacement?: TooltipProps["placement"]
	pending?: boolean
	appearance?: "solid" | "clear"
	size?: "sm" | "md" | "lg"
	square?: boolean
	active?: boolean
	align?: "start" | "middle" | "end"
}

export interface ButtonPropsAsButton extends ComponentProps<"button">, ButtonPropsBase {
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown
}

export interface ButtonPropsAsElement
	extends Disallowed<StrictOmit<ComponentProps<"button">, "className" | "key" | "children">>,
		ButtonPropsBase {
	element: ReactElement<{
		className?: string
		children?: React.ReactNode
		onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown
	}>
	className?: string
	children?: React.ReactNode
	key?: Key
}

export type ButtonProps = ButtonPropsAsButton | ButtonPropsAsElement

export function Button({
	text,
	icon,
	size = "md",
	appearance = "solid",
	square,
	active,
	pending: pendingProp,
	tooltip,
	tooltipPlacement,
	align = "middle",
	children,
	...props
}: ButtonProps) {
	const [transitionPending, startTransition] = useTransition()

	const status = useFormStatus()
	const pending = usePendingDelay(
		pendingProp ?? (transitionPending || (status.pending && props.type === "submit")),
	)

	const className = twMerge(
		panel(),

		"flex items-center gap-2 text-left",

		size === "sm" && (square ? "size-8" : "h-8 px-2"),
		size === "md" && (square ? "size-10" : "h-10 px-3"),
		size === "lg" && (square ? "size-12" : "h-12 px-4"),

		align === "start" && "justify-start",
		align === "middle" && "justify-center",
		align === "end" && "justify-end",

		"transition active:duration-0",
		"translate-y-0 active:translate-y-0.5",

		"aria-disabled:cursor-not-allowed aria-disabled:opacity-50",

		appearance === "solid" && [
			"before:bg-primary-300/60 hover:text-primary-700 active:before:bg-primary-300",

			"rounded border border-primary-300",

			"relative before:absolute before:inset-0 before:size-full",
			"before:transition active:before:duration-0",
			"before:origin-bottom before:scale-y-0 hover:before:scale-y-100",

			active && "text-primary-800",
		],

		appearance === "clear" && [
			"bg-primary-900",
			"bg-opacity-0 hover:bg-opacity-25 active:bg-opacity-50",
			"text-white text-opacity-80 hover:text-opacity-100",

			"border-transparent",

			"translate-y-0 active:translate-y-0.5",

			active && "bg-primary-800 bg-opacity-10 text-primary-800 text-opacity-100",
		],
	)

	const buttonChildren = (
		<>
			<div
				data-size={size}
				className="flex-center-row relative -mx-0.5 size-5 shrink-0 *:size-5 empty:hidden data-[size=lg]:size-8 data-[size=md]:size-6 *:data-[size=lg]:size-8 *:data-[size=md]:size-6"
			>
				{pending ?
					<Loading size="sm" fill="parent" />
				:	icon}
			</div>
			<div
				data-size={size}
				className={twMerge(
					"relative min-w-0 truncate empty:hidden",
					align === "start" ? "flex-1" : "shrink-1",
				)}
			>
				{children ?? text}
			</div>
		</>
	)

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		startTransition(() => {
			// if ((props.type ?? "button") === "submit" && event.currentTarget.form) {
			// 	event.currentTarget.form.requestSubmit()
			// }
			props.onClick?.(event)
		})
	}

	const element =
		"element" in props ?
			cloneElement(props.element, {
				className: twMerge(className, props.className),
				children: buttonChildren,
				onClick: handleClick,
			})
		:	<button
				type="button"
				{...withMergedClassName(props, "cursor-default", className)}
				// disabling buttons is bad a11y
				disabled={false}
				aria-disabled={props.disabled ?? pending}
				onClick={handleClick}
			>
				{buttonChildren}
			</button>

	if (!tooltip) {
		return element
	}

	return (
		<Tooltip content={tooltip} placement={tooltipPlacement}>
			{element}
		</Tooltip>
	)
}
