import React, { useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import { FocusOn } from "react-focus-on"
import { twMerge } from "tailwind-merge"
import { Heading, HeadingLevel } from "./heading.tsx"
import { mergeClassProp } from "./helpers.ts"
import { Panel } from "./panel.tsx"
import { fadeTransition, fadeZoomTransition } from "./transitions.ts"

function useModalState() {
	const [open, setOpen] = React.useState(false)
	return { open, setOpen }
}

const ModalContext = React.createContext<ReturnType<
	typeof useModalState
> | null>(null)

export function Modal({ children }: { children: React.ReactNode }) {
	const context = useModalState()
	return (
		<ModalContext.Provider value={context}>{children}</ModalContext.Provider>
	)
}

function useModalContext() {
	const context = React.useContext(ModalContext)
	if (context === null) {
		throw new Error("useModalContext must be used within a Modal provider")
	}
	return context
}

Modal.Button = ModalButton
function ModalButton(props: React.ComponentProps<"button">) {
	const context = useModalContext()
	return (
		<button
			type="button"
			{...props}
			onClick={(event) => {
				props.onClick?.(event)
				context.setOpen((open) => !open)
			}}
		/>
	)
}

Modal.Panel = ModalPanel
function ModalPanel({
	children,
	title,
	...props
}: React.ComponentProps<"div"> & {
	children: React.ReactNode
	title?: React.ReactNode
}) {
	const context = useModalContext()
	const shadeRef = useRef<HTMLDivElement>(null)

	// FocusOn can't steal focus state when turning on right away,
	// so we have to delay it on open
	const [enabled, setEnabled] = React.useState(false)
	useEffect(() => {
		setEnabled(context.open)
	}, [context.open])

	return ReactDOM.createPortal(
		<div
			className={twMerge(
				"fixed inset-0 z-10 flex overflow-y-auto bg-black/25 p-4 backdrop-blur transition-all *:m-auto",
				fadeTransition(context.open),
			)}
			ref={shadeRef}
			onPointerDown={(event) => {
				if (event.target === shadeRef.current) {
					context.setOpen(false)
				}
			}}
		>
			<FocusOn
				as={Panel}
				enabled={context.open ? enabled : false}
				onEscapeKey={() => context.setOpen(false)}
				onClickOutside={() => context.setOpen(false)}
				{...mergeClassProp(props, fadeZoomTransition(context.open))}
				shards={[shadeRef]}
			>
				<HeadingLevel>
					{title && <Heading>{title}</Heading>}
					{children}
				</HeadingLevel>
			</FocusOn>
		</div>,
		document.body,
	)
}
