import * as Ariakit from "@ariakit/react"
import { LucideX } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import { Except } from "type-fest"
import { button } from "~/styles/button.ts"
import { panel } from "~/styles/panel.ts"
import { primaryHeading, subText } from "~/styles/text.ts"
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

export function Content({
	children,
	className,
	title,
	description,
	...props
}: Except<Ariakit.DialogProps, "title"> & {
	title: ReactNode
	description?: string
}) {
	return (
		<Ariakit.Dialog
			backdrop={
				<div
					className={fadeTransition(
						"bg-primary-900/50 fixed inset-0 backdrop-blur-xs",
					)}
				/>
			}
			{...props}
			className={fadeZoomTransition(
				"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 md:p-4",
			)}
			unmountOnHide
		>
			<div
				className={panel(
					"p-gap shadow-primary-900/75 gap flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-lg flex-col rounded-lg shadow-lg",
					className,
				)}
			>
				<header className="bg-primary-900 gap -mx-3 -mt-3 flex items-center rounded-t-[inherit] px-3 py-2">
					<div className="flex-1">
						<Ariakit.DialogHeading className={primaryHeading()}>
							{title}
						</Ariakit.DialogHeading>
						{description && (
							<Ariakit.DialogDescription className={subText()}>
								{description}
							</Ariakit.DialogDescription>
						)}
					</div>
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

				{children}
			</div>
		</Ariakit.Dialog>
	)
}

export function Actions(props: ComponentProps<"footer">) {
	return (
		<footer {...props} className={twMerge("gap mt-auto flex justify-end")} />
	)
}
