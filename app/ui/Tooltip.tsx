import * as Ariakit from "@ariakit/react"
import type * as React from "react"

export function Tooltip(props: {
	content: React.ReactNode
	children: React.ReactElement
	placement?: Ariakit.TooltipProviderProps["placement"]
	providerProps?: Ariakit.TooltipProviderProps
	anchorProps?: Ariakit.TooltipAnchorProps
	tooltipProps?: Ariakit.TooltipProps
}) {
	return (
		<Ariakit.TooltipProvider placement={props.placement} {...props.providerProps}>
			<Ariakit.TooltipAnchor {...props.anchorProps} render={props.children} />
			<Ariakit.Tooltip
				className="pointer-events-none w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-0.5 text-center text-sm font-semibold text-primary-100 opacity-0 shadow-md shadow-black/50 transition data-[enter]:translate-y-0 data-[enter]:opacity-100"
				unmountOnHide
				{...props.tooltipProps}
			>
				{props.content}
			</Ariakit.Tooltip>
		</Ariakit.TooltipProvider>
	)
}
