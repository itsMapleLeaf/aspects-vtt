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
				"w-fit bg-primary-800 p-0 shadow-md",
				className,
			)}
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

export function Backdrop(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={fadeTransition(
				"fixed inset-0 bg-primary-900/25",
				props.className,
			)}
		/>
	)
}
