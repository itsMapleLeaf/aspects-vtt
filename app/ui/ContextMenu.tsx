import * as Ariakit from "@ariakit/react"
import {
	type ComponentProps,
	createContext,
	use,
	useEffect,
	useRef,
	useState,
} from "react"
import {
	createNonEmptyContext,
	useNonEmptyContext,
} from "../common/context.tsx"
import { Vector } from "../common/vector.ts"
import { Menu, MenuItem, MenuPanel } from "./Menu.tsx"

export interface ContextMenuProps extends ComponentProps<typeof Menu> {
	disabled?: boolean
}

const PointerContext = createContext(Vector.zero)
const SetPointerContext = createContext((_pointer: Vector) => {})
const StoreContext = createNonEmptyContext<Ariakit.MenuStore>()

export function ContextMenu(props: ContextMenuProps) {
	const store = Ariakit.useMenuStore()
	const [pointer, setPointer] = useState(Vector.zero)

	if (props.disabled) {
		return props.children
	}

	return (
		<PointerContext value={pointer}>
			<SetPointerContext value={setPointer}>
				<StoreContext value={store}>
					<Menu store={store} {...props} />
				</StoreContext>
			</SetPointerContext>
		</PointerContext>
	)
}

export function ContextMenuTrigger(props: ComponentProps<"div">) {
	const setPointer = use(SetPointerContext)
	const store = useNonEmptyContext(StoreContext)

	return (
		<div
			onContextMenu={(event) => {
				props.onContextMenu?.(event)
				if (event.defaultPrevented) return

				event.preventDefault()
				setPointer(Vector.from(event.clientX, event.clientY))
				store.show()
			}}
			{...props}
		/>
	)
}

export function ContextMenuPanel(props: ComponentProps<typeof MenuPanel>) {
	const pointer = use(PointerContext)
	const store = useNonEmptyContext(StoreContext)
	// eslint-disable-next-line react-compiler/react-compiler
	const open = store.useState("open")
	const ref = useRef<React.ComponentRef<typeof MenuPanel>>(null)

	// close on pointer down instead of pointer up
	useEffect(() => {
		if (!open) return
		const handler = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				store.hide()
			}
		}
		window.addEventListener("pointerdown", handler)
		return () => {
			window.removeEventListener("pointerdown", handler)
		}
	}, [open, store])

	return <MenuPanel getAnchorRect={() => pointer} ref={ref} {...props} />
}

export const ContextMenuItem = MenuItem
