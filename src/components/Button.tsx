import { Slot, Slottable } from "@radix-ui/react-slot"
import { startTransition, type ComponentProps, type ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { twMerge } from "tailwind-merge"
import { usePendingDelay } from "~/hooks/usePendingDelay.ts"
import { extract } from "~/lib/object.ts"
import type { StrictOmit } from "~/lib/types.ts"
import {
	button,
	buttonVariantNames,
	type ButtonVariantProps,
} from "~/styles/button.ts"
import { LoadingIcon } from "./LoadingIcon.tsx"

export interface ButtonProps
	extends ButtonVariantProps,
		StrictOmit<ComponentProps<"button">, "disabled"> {
	asChild?: boolean
	pending?: boolean
	icon?: ReactNode
}

export function Button({
	asChild,
	className,
	pending: pendingProp,
	children,
	icon,
	...props
}: ButtonProps) {
	const [variantProps, buttonProps] = extract(props, buttonVariantNames)

	const formStatus = useFormStatus()
	const pending = usePendingDelay(pendingProp ?? formStatus.pending)
	const disabled = variantProps.disabled ?? pending
	const Tag = asChild ? Slot : "button"

	return (
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
			<Slottable>{children}</Slottable>
		</Tag>
	)
}
