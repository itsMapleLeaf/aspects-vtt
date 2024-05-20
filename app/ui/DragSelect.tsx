import * as React from "react"
import { twMerge } from "tailwind-merge"
import { Rect } from "../common/Rect.ts"
import { setPresentInSet } from "../common/collection.ts"
import { useEffectEvent } from "../common/react.ts"
import type { StrictOmit } from "../common/types.ts"
import { RectDrawArea } from "./RectDrawArea.tsx"

export type DragSelectStore<V> = ReturnType<typeof useDragSelectStore<V>>

const empty: ReadonlySet<never> = new Set()

export function useDragSelectStore<T>() {
	const [selected, setSelected] = React.useState<ReadonlySet<T>>(empty)
	const [area, setArea] = React.useState<Rect>()

	const setItemSelected = useEffectEvent(function setItemSelected(
		item: T,
		selected: boolean,
	) {
		setSelected((items) => setPresentInSet(items, item, selected))
	})

	const clear = useEffectEvent(function clear() {
		setSelected(empty)
	})

	const isSelected = React.useCallback(
		(item: T) => selected.has(item),
		[selected],
	)

	return { selected, area, setItemSelected, clear, setArea, isSelected }
}

export interface DragSelectAreaProps extends React.ComponentProps<"div"> {
	store: StrictOmit<DragSelectStore<unknown>, "setItemSelected" | "isSelected">
}

export function DragSelectArea({ store, ...props }: DragSelectAreaProps) {
	return (
		<RectDrawArea
			{...props}
			rect={store.area}
			onRectChange={store.setArea}
			onInit={() => store.clear()}
		/>
	)
}

export interface DragSelectableProps<V> extends React.ComponentProps<"div"> {
	item: V
	store: DragSelectStore<V>
}

export function DragSelectable<V>({
	item,
	store,
	...props
}: DragSelectableProps<V>) {
	const ref = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (!ref.current) return
		if (!store.area) return
		const rect = Rect.from(ref.current.getBoundingClientRect())
		store.setItemSelected(item, rect.overlaps(store.area))
	}, [item, store.area, store.setItemSelected])

	return (
		<div
			{...props}
			className={twMerge("touch-none", props.className)}
			ref={ref}
			onPointerDown={(event) => {
				props.onPointerDown?.(event)
				if (!store.isSelected(item) && event.buttons === 1) {
					store.clear()
					store.setItemSelected(item, true)
				}
			}}
			data-selected={store.isSelected(item) || undefined}
		/>
	)
}
