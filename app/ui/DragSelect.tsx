import * as React from "react"
import { twMerge } from "tailwind-merge"
import { Rect } from "../common/Rect.ts"
import { setPresentInSet } from "../common/collection.ts"
import { expect } from "../common/expect.ts"
import { RectDrawArea } from "./RectDrawArea.tsx"

export type DragSelectStore<V> = ReturnType<typeof useDragSelectStore<V>>

type SelectableHandle<T> = {
	item: T
	overlaps: (area: Rect) => boolean
}

const empty: ReadonlySet<never> = new Set()

export function useDragSelectStore<T>() {
	const [selected, setSelected] = React.useState<ReadonlySet<T>>(empty)
	const [areaState, setAreaState] = React.useState<Rect>()
	const [handles] = React.useState(() => new Set<SelectableHandle<T>>())

	function setItemSelected(item: T, selected: boolean) {
		setSelected((items) => setPresentInSet(items, item, selected))
	}

	function clear() {
		setSelected(empty)
	}

	function isSelected(item: T) {
		return selected.has(item)
	}

	function registerHandle(handle: SelectableHandle<T>) {
		handles.add(handle)
		return () => {
			handles.delete(handle)
		}
	}

	function setArea(area: Rect | undefined) {
		setAreaState(area)
		if (area) {
			React.startTransition(() => {
				setSelected((current) => {
					const next = new Set(
						Iterator.from(handles)
							.filter((h) => h.overlaps(area))
							.map((h) => h.item),
					)
					if (next.size !== current.size) {
						return next
					}
					if (Iterator.from(next).intersection(current).count() > 0) {
						return next
					}
					return current
				})
			})
		}
	}

	return {
		selected,
		clear,
		setItemSelected,
		isSelected,

		area: areaState,
		setArea,

		registerHandle,
	}
}

export interface DragSelectAreaProps extends React.ComponentProps<"div"> {
	store: Pick<DragSelectStore<unknown>, "area" | "setArea" | "clear">
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
		return store.registerHandle({
			item,
			overlaps(area) {
				return area.overlaps(
					Rect.from(expect(ref.current).getBoundingClientRect()),
				)
			},
		})
	}, [item, store])

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
