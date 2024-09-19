import * as Ariakit from "@ariakit/react"

import { cn } from "~/ui/helpers"

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

export { Tooltip, TooltipContent, TooltipTrigger }
