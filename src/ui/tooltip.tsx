import * as Ariakit from "@ariakit/react"
import * as React from "react"

import { cn } from "~/ui/helpers"

// this is a no-op leftover from radix that's no longer needed
const TooltipProvider = ({ children }: { children: React.ReactNode }) =>
	children

const Tooltip = Ariakit.TooltipProvider

const TooltipTrigger = Ariakit.TooltipAnchor

const TooltipContent = ({ className, ...props }: Ariakit.TooltipProps) => (
	<Ariakit.Tooltip
		gutter={8}
		className={cn(
			"scale-90 overflow-hidden rounded-md bg-primary-100 px-2 py-1.5 text-sm leading-none text-primary-900 opacity-0 shadow transition data-[enter]:scale-100 data-[enter]:opacity-100",
			className,
		)}
		unmountOnHide
		{...props}
	/>
)

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
