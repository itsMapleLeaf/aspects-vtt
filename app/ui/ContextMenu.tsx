import * as Ariakit from "@ariakit/react"
import { type ComponentProps, createContext, use, useState } from "react"
import { createNonEmptyContext, useNonEmptyContext } from "../common/context.tsx"
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
	return <MenuPanel modal getAnchorRect={() => pointer} {...props} />
}

export const ContextMenuItem = MenuItem
