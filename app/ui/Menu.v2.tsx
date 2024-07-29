import { offset, shift, useFloating } from "@floating-ui/react-dom"
import * as React from "react"
import { FocusOn } from "react-focus-on"
import { type Nullish, typed } from "~/helpers/types.ts"
import { Button, type ButtonProps } from "./Button.tsx"
import { TranslucentPanel } from "./Panel.tsx"
import { Portal } from "./Portal.tsx"
import { Slottable, type SlottableProps } from "./Slottable.tsx"
import { withMergedClassName } from "./withMergedClassName.ts"

const Context = React.createContext({
	panelId: typed<string | undefined>(undefined),
	open: false,
	setOpen: (open: boolean) => {},
	referenceRef: typed<React.RefCallback<Element>>(() => {}),
	panelRef: typed<React.RefCallback<Element>>(() => {}),
	panelStyle: typed<React.CSSProperties>({}),
})

export function Menu({
	children,
	...props
}: {
	children: React.ReactNode
	open?: boolean
	setOpen?: (open: boolean) => void
}) {
	const [open, setOpen] = React.useState(false)
	const panelId = React.useId()

	const floating = useFloating({
		open,
		middleware: [offset(8), shift({ padding: 8 })],
	})

	const context: React.ContextType<typeof Context> = {
		open: props.open ?? open,
		setOpen: props.setOpen ?? setOpen,

		panelId,
		panelRef: floating.refs.setFloating,
		panelStyle: floating.floatingStyles,

		referenceRef: floating.refs.setReference,
	}

	return <Context value={context}>{children}</Context>
}

export function MenuToggle(props: SlottableProps) {
	const context = React.use(Context)
	const ref = useCombinedRef(props.ref, context.referenceRef)
	return (
		<Slottable
			{...props}
			fallback={<button type="button" />}
			aria-controls={context.panelId}
			aria-expanded={context.open}
			ref={ref}
			onClick={(event: React.MouseEvent<HTMLElement>) => {
				props.element?.props.onClick?.(event)
				props.onClick?.(event)
				if (event.defaultPrevented) return
				context.setOpen(!context.open)
			}}
		/>
	)
}

export function MenuPanel(props: React.ComponentProps<"div">) {
	const context = React.use(Context)
	return context.open ?
			<Portal>
				{/* wrap in a fullscreen div to prevent interaction on everything else */}
				<div className="fixed inset-0 bg-black/25">
					<div ref={context.panelRef} style={context.panelStyle}>
						<FocusOn
							enabled
							onClickOutside={() => context.setOpen(false)}
							onEscapeKey={() => context.setOpen(false)}
						>
							<TranslucentPanel {...withMergedClassName(props, "grid gap-1 p-1 min-w-48")} />
						</FocusOn>
					</div>
				</div>
			</Portal>
		:	null
}

export function MenuItem(props: ButtonProps) {
	const context = React.use(Context)
	return (
		<Button
			appearance="clear"
			align="start"
			{...props}
			onClick={(event) => {
				if ("element" in props) {
					props.element.props.onClick?.(event)
				} else {
					props.onClick?.(event)
				}
				if (event.defaultPrevented) return
				context.setOpen(false)
			}}
		/>
	)
}

function useCombinedRef<T>(...refs: Nullish<React.Ref<T>>[]) {
	const cache = React.useRef<typeof refs>(refs)
	React.useEffect(() => {
		cache.current = refs
	})

	return React.useCallback((handle: T | null) => {
		for (const ref of cache.current) {
			if (typeof ref === "function") {
				ref(handle)
			} else if (ref != null) {
				ref.current = handle
			}
		}
	}, [])
}
