import { Portal, Transition, TransitionChild } from "@headlessui/react"
import * as React from "react"
import { FocusOn } from "react-focus-on"
import { TranslucentPanel } from "./Panel.tsx"
import { Slottable, type SlottableProps } from "./Slottable.tsx"
import { withMergedClassName } from "./withMergedClassName.ts"

const Context = React.createContext({
	panelId: "",
	open: false,
	setOpen: (open: boolean) => {},
})

export function Modal({
	children,
	...props
}: {
	children: React.ReactNode
	open?: boolean
	setOpen?: (open: boolean) => void
}) {
	const [open, setOpen] = React.useState(false)
	const panelId = React.useId()
	return (
		<Context
			value={{
				panelId,
				open: props.open ?? open,
				setOpen: props.setOpen ?? setOpen,
			}}
		>
			{children}
		</Context>
	)
}

export function ModalToggle(props: SlottableProps) {
	const context = React.use(Context)
	return (
		<Slottable
			{...props}
			fallback={<button type="button" />}
			aria-controls={context.panelId}
			aria-expanded={context.open}
			onClick={(event: React.MouseEvent<HTMLElement>) => {
				props.element?.props.onClick?.(event)
				props.onClick?.(event)
				if (event.defaultPrevented) return
				context.setOpen(!context.open)
			}}
		/>
	)
}

export function ModalContent(props: React.ComponentProps<"div">) {
	const context = React.use(Context)
	return (
		<Transition show={context.open} appear>
			<Portal>
				<FocusOn enabled={context.open} onEscapeKey={() => context.setOpen(false)}>
					<TransitionChild>
						<div
							id={context.panelId}
							aria-expanded={context.open}
							onPointerDown={(event) => {
								if (event.target === event.currentTarget) {
									context.setOpen(false)
								}
							}}
							className="fixed inset-0 flex flex-col overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur transition will-change-transform data-[closed]:opacity-0 data-[closed]:ease-in data-[open]:ease-out"
						>
							<TransitionChild>
								<TranslucentPanel
									{...withMergedClassName(
										props,
										"m-auto w-full max-w-screen-sm transition data-[open]:ease-out data-[closed]:ease-in data-[closed]:scale-95 will-change-transform",
									)}
								/>
							</TransitionChild>
						</div>
					</TransitionChild>
				</FocusOn>
			</Portal>
		</Transition>
	)
}
