import * as Ariakit from "@ariakit/react"

import { cn } from "~/ui/helpers"

// todo: rename this and export a simple `Tooltip` that doesn't require a tree of bullshit
const Tooltip = Ariakit.TooltipProvider

const TooltipTrigger = Ariakit.TooltipAnchor

const TooltipContent = ({ className, ...props }: Ariakit.TooltipProps) => (
	<Ariakit.Tooltip
		gutter={8}
		className={cn(
			"bg-primary-100 text-primary-900 max-w-48 scale-90 overflow-hidden rounded-md px-2 py-1.5 text-center text-sm leading-tight opacity-0 shadow-sm transition data-enter:scale-100 data-enter:opacity-100",
			className,
		)}
		unmountOnHide
		portal
		{...props}
	/>
)

export { Tooltip, TooltipContent, TooltipTrigger }
