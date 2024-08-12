import * as Ariakit from "@ariakit/react"
import React, { ComponentProps, ReactNode } from "react"
import { Heading, HeadingLevel } from "./heading.tsx"
import { mergeClassProp } from "./helpers.ts"

export function Modal(props: Ariakit.DialogProviderProps) {
	return <Ariakit.DialogProvider {...props} />
}

export const ModalButton = Ariakit.DialogDisclosure

export function ModalPanel({
	children,
	title,
	...props
}: Ariakit.DialogProps & {
	title?: React.ReactNode
}) {
	return (
		<Ariakit.Dialog
			unmountOnHide
			backdrop={
				<div className="absolute inset-0 bg-black/50 opacity-0 backdrop-blur-sm transition data-[enter]:opacity-100"></div>
			}
			{...mergeClassProp(
				props,
				"rounded-box fixed inset-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-95 bg-base-300 p-3 opacity-0 transition data-[enter]:scale-100 data-[enter]:opacity-100",
			)}
		>
			{children}
		</Ariakit.Dialog>
	)
}

export function ModalHeading({
	children,
	text,
	...props
}: ComponentProps<typeof Heading> & { text: ReactNode }) {
	return (
		<HeadingLevel>
			<Heading {...props}>{text}</Heading>
			{children}
		</HeadingLevel>
	)
}
