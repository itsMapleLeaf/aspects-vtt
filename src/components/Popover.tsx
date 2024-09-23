import * as Ariakit from "@ariakit/react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { menuPanel } from "~/styles/menu.ts"
import { fadeTransition } from "~/styles/transitions.ts"

export * as Popover from "./Popover.tsx"

export function Root(props: Ariakit.PopoverProviderProps) {
	return <Ariakit.PopoverProvider {...props} />
}

export function Button(props: Ariakit.PopoverDisclosureProps) {
	return <Ariakit.PopoverDisclosure {...props} />
}

export function Close(props: Ariakit.PopoverDismissProps) {
	return <Ariakit.PopoverDismiss {...props} />
}

export interface ContentProps extends Ariakit.PopoverProps {}

export function Content({ children, className, ...props }: ContentProps) {
	return (
		<Ariakit.Popover
			backdrop={
				<div className={fadeTransition("fixed inset-0 bg-primary-900/25")} />
			}
			{...props}
			className={menuPanel("bg-primary-800")}
			unmountOnHide
			gutter={8}
			portal
		>
			{children}
		</Ariakit.Popover>
	)
}

export function Actions(props: ComponentProps<"footer">) {
	return (
		<footer {...props} className={twMerge("mt-auto flex justify-end gap")} />
	)
}
