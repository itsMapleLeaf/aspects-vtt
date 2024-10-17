import { TooltipProviderProps } from "@ariakit/react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import {
	ReactElement,
	startTransition,
	type ComponentProps,
	type ReactNode,
} from "react"
import { useFormStatus } from "react-dom"
import { twMerge } from "tailwind-merge"
import { extract } from "~/common/object.ts"
import type { StrictOmit } from "~/common/types.ts"
import {
	button,
	buttonVariantNames,
	type ButtonVariantProps,
} from "~/styles/button.ts"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.tsx"
import { LoadingIcon } from "./LoadingIcon.tsx"

export interface ButtonProps
	extends ButtonVariantProps,
		StrictOmit<ComponentProps<"button">, "disabled"> {
	asChild?: boolean
	pending?: boolean
	icon?: ReactNode
	tooltip?: string | ReactElement
	tooltipPlacement?: TooltipProviderProps["placement"]
}

export function Button({
	asChild,
	className,
	pending: pendingProp,
	children,
	icon,
	tooltip,
	tooltipPlacement,
	...props
}: ButtonProps) {
	const [variantProps, buttonProps] = extract(props, buttonVariantNames)

	const formStatus = useFormStatus()
	const pending = pendingProp ?? formStatus.pending
	const disabled = variantProps.disabled ?? pending
	const Tag = asChild ? Slot : "button"

	const element = (
		<Tag
			type={Tag === "button" ? "button" : undefined}
			{...buttonProps}
			className={twMerge(button({ ...variantProps, disabled }), className)}
			onClick={(event) => {
				if (disabled) {
					event.preventDefault()
				} else {
					startTransition(() => {
						buttonProps.onClick?.(event)
					})
				}
			}}
		>
			{pending ? <LoadingIcon data-control-icon /> : icon}
			<Slottable>
				{children ??
					(tooltip ? <span className="sr-only">{tooltip}</span> : null)}
			</Slottable>
		</Tag>
	)

	if (!tooltip) {
		return element
	}

	return (
		<Tooltip placement={tooltipPlacement}>
			<TooltipTrigger render={element} />
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	)
}
