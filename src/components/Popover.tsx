import * as Ariakit from "@ariakit/react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { panel } from "~/styles/panel.ts"
import { fadeTransition, fadeZoomTransition } from "~/styles/transitions.ts"

export * as Popover from "./Popover.tsx"

export function Root(props: Ariakit.PopoverProviderProps) {
	return <Ariakit.PopoverProvider {...props} />
}

export function Button(props: Ariakit.PopoverDisclosureProps) {
	return <Ariakit.PopoverDisclosure {...props} />
}

export function Anchor(props: Ariakit.PopoverAnchorProps) {
	return <Ariakit.PopoverAnchor {...props} />
}

export function Close(props: Ariakit.PopoverDismissProps) {
	return <Ariakit.PopoverDismiss {...props} />
}

export function Content({
	children,
	className,
	...props
}: Ariakit.PopoverProps) {
	return (
		<Ariakit.Popover
			backdrop={props.backdrop ?? <Backdrop />}
			unmountOnHide
			gutter={8}
			portal
			{...props}
			className={panel(
				fadeZoomTransition(),
				"bg-primary-800 w-fit p-0 shadow-md",
				className,
			)}
		>
			{children}
		</Ariakit.Popover>
	)
}

export function Actions(props: ComponentProps<"footer">) {
	return (
		<footer {...props} className={twMerge("gap mt-auto flex justify-end")} />
	)
}

export function Backdrop(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={fadeTransition(
				"bg-primary-900/25 fixed inset-0",
				props.className,
			)}
		/>
	)
}
