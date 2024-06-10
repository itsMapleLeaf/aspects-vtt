import {
	type ComponentPropsWithoutRef,
	type ReactElement,
	type ReactNode,
	cloneElement,
} from "react"
import { useFormStatus } from "react-dom"
import { twMerge } from "tailwind-merge"
import { useSafeAction } from "../common/convex.ts"
import type { Disallowed, StrictOmit } from "../common/types.ts"
import { Loading } from "./Loading.tsx"
import { Tooltip } from "./Tooltip.tsx"
import { panel } from "./styles.ts"
import { withMergedClassName } from "./withMergedClassName"

interface ButtonPropsBase extends ButtonStyleProps {
	icon: ReactNode
	text?: ReactNode
	tooltip?: ReactNode
	pending?: boolean
}

export interface ButtonPropsAsButton extends ComponentPropsWithoutRef<"button">, ButtonPropsBase {
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown
}

export interface ButtonPropsAsElement
	extends Disallowed<StrictOmit<ComponentPropsWithoutRef<"button">, "className">>,
		ButtonPropsBase {
	element: ReactElement<{ className?: string; children?: React.ReactNode }>
	className?: string
}

export type ButtonProps = ButtonPropsAsButton | ButtonPropsAsElement

export function Button({
	text,
	icon,
	tooltip,
	size = "md",
	pending: pendingProp,
	...props
}: ButtonProps) {
	const [, handleClick, actionPending] = useSafeAction(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			return props.onClick?.(event)
		},
	)
	const status = useFormStatus()
	const pending = pendingProp ?? ((status.pending && props.type === "submit") || actionPending)

	const className = buttonStyle({ size })

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
			<span data-size={size} className="relative whitespace-nowrap empty:hidden">
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
				disabled={pending}
				{...withMergedClassName(props, "cursor-default", className)}
				onClick={handleClick}
			>
				{children}
			</button>

	if (!tooltip) {
		return element
	}

	return <Tooltip content={tooltip}>{element}</Tooltip>
}

export interface ButtonStyleProps {
	size?: "sm" | "md" | "lg"
}

export function buttonStyle({ size = "md" }: ButtonStyleProps) {
	return twMerge(
		"flex-center-row gap-2",

		size === "sm" && "h-8 px-2",
		size === "md" && "h-10 px-3",
		size === "lg" && "h-12 px-4",

		"rounded border border-primary-300",

		"relative before:absolute before:inset-0 before:size-full",

		"transition active:duration-0",
		"before:transition active:before:duration-0",

		"bg-primary-300/30",
		"before:bg-primary-300/60 hover:text-primary-700 active:before:bg-primary-300",

		"translate-y-0 active:translate-y-0.5",
		"before:origin-bottom before:scale-y-0 hover:before:scale-y-100",

		"disabled:opacity-50",

		panel(),
	)
}
