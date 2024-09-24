import * as Ariakit from "@ariakit/react"
import { LucideX } from "lucide-react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { button } from "~/styles/button.ts"
import { panel } from "~/styles/panel.ts"
import { primaryHeading } from "~/styles/text.ts"
import { fadeTransition, fadeZoomTransition } from "~/styles/transitions.ts"

export * as Dialog from "./Dialog.tsx"

export function Root(props: Ariakit.DialogProviderProps) {
	return <Ariakit.DialogProvider {...props} />
}

export function Button(props: Ariakit.DialogDisclosureProps) {
	return <Ariakit.DialogDisclosure {...props} />
}

export function Close(props: Ariakit.DialogDismissProps) {
	return <Ariakit.DialogDismiss {...props} />
}

export interface ContentProps extends Ariakit.DialogProps {
	title: string
	description?: string
}

export function Content({
	children,
	className,
	title,
	description,
	...props
}: ContentProps) {
	return (
		<Ariakit.Dialog
			backdrop={
				<div
					className={fadeTransition(
						"fixed inset-0 bg-primary-900/50 backdrop-blur-sm",
					)}
				/>
			}
			{...props}
			className={fadeZoomTransition(
				"fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 md:p-4",
			)}
			unmountOnHide
		>
			<div
				className={panel(
					"flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-lg flex-col rounded-lg p-gap shadow-lg shadow-primary-900/75 gap",
					className,
				)}
			>
				<header className="-mx-3 -mt-3 flex items-center rounded-t-[inherit] bg-primary-900 px-3 py-2 gap">
					<Ariakit.DialogHeading className={primaryHeading("flex-1")}>
						{title}
					</Ariakit.DialogHeading>
					<Ariakit.DialogDismiss
						className={button({
							appearance: "clear",
							square: true,
							rounded: true,
							className: "-mx-1",
						})}
					>
						<LucideX />
					</Ariakit.DialogDismiss>
				</header>
				{description && (
					<Ariakit.DialogDescription>{description}</Ariakit.DialogDescription>
				)}
				{children}
			</div>
		</Ariakit.Dialog>
	)
}

export function Actions(props: ComponentProps<"footer">) {
	return (
		<footer {...props} className={twMerge("mt-auto flex justify-end gap")} />
	)
}
