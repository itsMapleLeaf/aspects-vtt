import * as Ariakit from "@ariakit/react"
import type { ComponentPropsWithoutRef } from "react"

export interface TooltipProps extends ComponentPropsWithoutRef<"button"> {
	text: React.ReactNode
	placement?: Ariakit.TooltipProviderProps["placement"]
	buttonRef?: React.Ref<HTMLButtonElement>
}

export function Tooltip({ text, placement, buttonRef, ...props }: TooltipProps) {
	return (
		<Ariakit.TooltipProvider placement={placement}>
			<Ariakit.TooltipAnchor render={<button type="button" {...props} ref={buttonRef} />} />
			<Ariakit.Tooltip
				className="w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-0.5 text-center text-sm font-semibold text-primary-100 opacity-0 shadow-md shadow-black/50 transition data-[enter]:translate-y-0 data-[enter]:opacity-100"
				unmountOnHide
			>
				{text}
			</Ariakit.Tooltip>
		</Ariakit.TooltipProvider>
	)
}
