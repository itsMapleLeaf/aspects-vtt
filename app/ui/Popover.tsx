import * as Ariakit from "@ariakit/react"
import { twMerge, type ClassNameValue } from "tailwind-merge"
import { TranslucentPanel } from "./Panel.tsx"

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
			render={<TranslucentPanel />}
			portal
			gutter={8}
			unmountOnHide
			{...props}
			className={PopoverPanel.style(props.className)}
		/>
	)
}

PopoverPanel.style = (...classes: ClassNameValue[]) =>
	twMerge(
		"translate-y-2 opacity-0 transition data-[enter]:translate-y-0 data-[enter]:opacity-100",
		...classes,
	)

export function PopoverDismiss(props: Ariakit.PopoverDismissProps) {
	return <Ariakit.PopoverDismiss {...props} />
}
