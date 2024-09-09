import * as Ariakit from "@ariakit/react"
import { LucideX } from "lucide-react"
import React, { ComponentProps, ReactNode } from "react"
import { Heading, HeadingLevel } from "./heading.tsx"
import { clearCircleButton, heading2xl, panel } from "./styles.ts"

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
			backdrop={
				<div className="absolute inset-0 bg-black/50 opacity-0 backdrop-blur-sm transition data-[enter]:opacity-100"></div>
			}
			unmountOnHide
			{...props}
			className={panel(
				"fixed inset-auto left-1/2 top-1/2 flex max-h-[calc(100vh-2rem)] w-full max-w-[calc(min(32rem,100vw-2rem))] -translate-x-1/2 -translate-y-1/2 scale-95 flex-col rounded-lg bg-primary-800 p-3 opacity-0 transition gap-3 data-[enter]:scale-100 data-[enter]:opacity-100",
				props.className,
			)}
		>
			<div className="-m-3 mb-3 flex h-14 items-center justify-between rounded-t-[inherit] border-b border-primary-600 bg-primary-900 px-3">
				<Ariakit.DialogHeading className={heading2xl()}>
					{title}
				</Ariakit.DialogHeading>
				<Ariakit.DialogDismiss className={clearCircleButton("-mx-2")}>
					<LucideX />
				</Ariakit.DialogDismiss>
			</div>
			<div className="-m-3 min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
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
