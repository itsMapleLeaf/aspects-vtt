import * as Ariakit from "@ariakit/react"
import { twMerge } from "tailwind-merge"
import { panel } from "./styles.ts"

export const usePopoverStore = Ariakit.usePopoverStore

export function Popover(props: Ariakit.PopoverProviderProps) {
	return <Ariakit.PopoverProvider {...props} />
}

export function PopoverTrigger(props: Ariakit.PopoverDisclosureProps) {
	return <Ariakit.PopoverDisclosure {...props} />
}

export function PopoverPanel(props: Ariakit.PopoverProps) {
	return (
		<Ariakit.Popover
			portal
			gutter={8}
			unmountOnHide
			{...props}
			className={twMerge(PopoverPanel.style, props.className)}
		/>
	)
}
PopoverPanel.style = panel(
	"translate-y-2 bg-primary-100 opacity-0 shadow transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
)
