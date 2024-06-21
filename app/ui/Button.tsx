import {
	type ComponentProps,
	type Key,
	type ReactElement,
	type ReactNode,
	cloneElement,
} from "react"
import { useFormStatus } from "react-dom"
import { twMerge } from "tailwind-merge"
import { usePendingDelay } from "~/helpers/react/hooks.ts"
import type { Disallowed, StrictOmit } from "../helpers/types.ts"
import { useSafeAction } from "../modules/convex/helpers.ts"
import { Loading } from "./Loading.tsx"
import { Tooltip, type TooltipProps } from "./Tooltip.tsx"
import { panel } from "./styles.ts"
import { withMergedClassName } from "./withMergedClassName"

interface ButtonPropsBase {
	icon: ReactNode
	text?: ReactNode
	tooltip?: ReactNode
	tooltipPlacement?: TooltipProps["placement"]
	pending?: boolean
	appearance?: "solid" | "clear"
	size?: "sm" | "md" | "lg"
}

export interface ButtonPropsAsButton extends ComponentProps<"button">, ButtonPropsBase {
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown
}

export interface ButtonPropsAsElement
	extends Disallowed<StrictOmit<ComponentProps<"button">, "className" | "key">>,
		ButtonPropsBase {
	element: ReactElement<{ className?: string; children?: React.ReactNode }>
	className?: string
	key?: Key
}

export type ButtonProps = ButtonPropsAsButton | ButtonPropsAsElement

export function Button({
	text,
	icon,
	size = "md",
	appearance = "solid",
	pending: pendingProp,
	tooltip,
	tooltipPlacement,
	...props
}: ButtonProps) {
	const [, handleClick, actionPending] = useSafeAction(
		async (event: React.MouseEvent<HTMLButtonElement>) => {
			if (props.disabled) return
			await props.onClick?.(event)
		},
	)

	const status = useFormStatus()
	const pending = usePendingDelay(
		pendingProp ?? ((status.pending && props.type === "submit") || actionPending),
	)

	const className = twMerge(
		panel(),

		"flex-center-row gap-2",

		size === "sm" && "h-8 px-2",
		size === "md" && "h-10 px-3",
		size === "lg" && "h-12 px-4",

		"transition active:duration-0",
		"translate-y-0 active:translate-y-0.5",

		"aria-disabled:cursor-not-allowed aria-disabled:opacity-50",

		appearance === "solid" && [
			"rounded border border-primary-300",

			"bg-primary-300/30",
			"before:bg-primary-300/60 hover:text-primary-700 active:before:bg-primary-300",

			"relative before:absolute before:inset-0 before:size-full",

			"before:transition active:before:duration-0",

			"before:origin-bottom before:scale-y-0 hover:before:scale-y-100",
		],

		appearance === "clear" && [
			"bg-primary-900",
			"bg-opacity-0 hover:bg-opacity-25 active:bg-opacity-50",
			"text-opacity-75 hover:text-opacity-100",

			"border-transparent",

			"translate-y-0 active:translate-y-0.5",
		],
	)

	const children = (
		<>
			<span
				data-size={size}
				className="flex-center-row relative -mx-0.5 size-5 *:size-5 empty:hidden data-[size=lg]:size-8 *:data-[size=lg]:size-8"
			>
				{pending ?
					<Loading size="sm" />
				:	icon}
			</span>
			<span
				data-size={size}
				className="shrink-1 relative min-w-0 overflow-clip text-ellipsis whitespace-nowrap empty:hidden"
			>
				{text}
			</span>
		</>
	)

	const element =
		"element" in props ?
			cloneElement(props.element, {
				className: twMerge(className, props.className),
				children,
			})
		:	<button
				type="button"
				{...withMergedClassName(props, "cursor-default", className)}
				// disabling buttons is bad a11y
				disabled={false}
				aria-disabled={props.disabled ?? pending}
				// passing onClick keeps the button from acting as a form submitter,
				// so only pass handleClick if an onClick is provided
				onClick={props.onClick && handleClick}
			>
				{children}
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
