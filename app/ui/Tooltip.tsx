import * as Ariakit from "@ariakit/react"
import type * as React from "react"
import type { StrictOmit } from "../helpers/types.ts"

export interface TooltipProps extends StrictOmit<Ariakit.TooltipAnchorProps, "content"> {
	content: React.ReactNode
	children: React.ReactElement
	placement?: Ariakit.TooltipProviderProps["placement"]
	tooltipProps?: Ariakit.TooltipProps
}

export function Tooltip({ content, children, placement, tooltipProps, ...props }: TooltipProps) {
	// can't use a provider here, it conflicts with other disclosure providers
	// https://github.com/ariakit/ariakit/issues/3754
	const store = Ariakit.useTooltipStore({ placement })
	return (
		<>
			<Ariakit.TooltipAnchor store={store} render={children} {...props} />
			<span className="sr-only">{content}</span>
			<Ariakit.Tooltip
				store={store}
				className="pointer-events-none w-fit max-w-32 translate-y-1 rounded bg-white px-2 py-0.5 text-center text-sm font-semibold text-primary-100 opacity-0 shadow-md transition data-[enter]:translate-y-0 data-[enter]:opacity-100"
				unmountOnHide
				{...tooltipProps}
			>
				{content}
			</Ariakit.Tooltip>
		</>
	)
}
