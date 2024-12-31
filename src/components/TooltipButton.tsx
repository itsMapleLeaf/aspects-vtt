import type { TooltipProviderProps } from "@ariakit/react"
import type { ComponentProps, ReactElement } from "react"
import type { StrictOmit } from "~/lib/types.ts"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.tsx"
import { Button } from "./Button.tsx"

export interface TooltipButtonProps
	extends StrictOmit<ComponentProps<typeof Button>, "children"> {
	tooltip: string | ReactElement
	tooltipPlacement?: TooltipProviderProps["placement"]
}

export function TooltipButton({
	tooltip,
	tooltipPlacement,
	...props
}: TooltipButtonProps) {
	return (
		<Tooltip placement={tooltipPlacement}>
			<TooltipTrigger
				render={
					<Button {...props}>
						<span className="sr-only">{tooltip}</span>
					</Button>
				}
			/>
			<TooltipContent>{tooltip}</TooltipContent>
		</Tooltip>
	)
}
