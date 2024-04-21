import * as Ariakit from "@ariakit/react"
import type { ComponentPropsWithoutRef } from "react"
import * as React from "react"

export interface TooltipProps extends ComponentPropsWithoutRef<"button"> {
	text: React.ReactNode
	placement?: Ariakit.TooltipProviderProps["placement"]
	buttonRef?: React.Ref<HTMLButtonElement>
}

export function Tooltip({ text, placement, buttonRef, ...props }: TooltipProps) {
	return (
		<TooltipProvider placement={placement}>
			<TooltipAnchor render={<button type="button" {...props} ref={buttonRef} />} />
			<TooltipContent>{text}</TooltipContent>
		</TooltipProvider>
	)
}

export function TooltipProvider(props: Ariakit.TooltipProviderProps) {
	return <Ariakit.TooltipProvider {...props} />
}

export const TooltipAnchor = Ariakit.TooltipAnchor

export const TooltipContent = React.forwardRef<HTMLDivElement, Ariakit.TooltipProps>(
	(props, ref) => (
		<Ariakit.Tooltip
			className="w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-0.5 text-center text-sm font-semibold text-primary-100 opacity-0 shadow-md shadow-black/50 transition data-[enter]:translate-y-0 data-[enter]:opacity-100"
			unmountOnHide
			{...props}
			ref={ref}
		/>
	),
)
