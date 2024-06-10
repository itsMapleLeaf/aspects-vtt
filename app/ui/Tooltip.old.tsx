import * as Ariakit from "@ariakit/react"
import type { ComponentPropsWithoutRef } from "react"
import * as React from "react"

/** @deprecated */
export interface TooltipProps extends ComponentPropsWithoutRef<"button"> {
	text: React.ReactNode
	placement?: Ariakit.TooltipProviderProps["placement"]
	buttonRef?: React.Ref<HTMLButtonElement>
}

/** @deprecated */
export function Tooltip({ text, placement, buttonRef, ...props }: TooltipProps) {
	return (
		<TooltipProvider placement={placement}>
			<TooltipAnchor render={<button type="button" {...props} ref={buttonRef} />} />
			<TooltipContent>{text}</TooltipContent>
		</TooltipProvider>
	)
}

/** @deprecated */
export function TooltipProvider(props: Ariakit.TooltipProviderProps) {
	return <Ariakit.TooltipProvider {...props} />
}

/** @deprecated */
export const TooltipAnchor = Ariakit.TooltipAnchor

/** @deprecated */
export function TooltipContent(props: Ariakit.TooltipProps) {
	return (
		<Ariakit.Tooltip
			className="w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-0.5 text-center text-sm font-semibold text-primary-100 opacity-0 shadow-md transition data-[enter]:translate-y-0 data-[enter]:opacity-100"
			unmountOnHide
			{...props}
		/>
	)
}
