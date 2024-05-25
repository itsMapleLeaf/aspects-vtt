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
	const [selectedState, setSelectedState] = React.useState<ReadonlySet<T>>(empty)
	const [areaState, setAreaState] = React.useState<Rect>()
	const [handles, setHandles] = React.useState<ReadonlySet<SelectableHandle<T>>>(() => new Set())

	let selected = selectedState
	if (areaState) {
		selected = new Set([
			...selected,
			...Iterator.from(handles)
				.filter((h) => h.overlaps(areaState))
				.map((h) => h.item),
		])
	}

	function startFreshSelection(event: PointerEvent) {
		startAdditiveSelection(event)
		setSelectedState(empty)
	}

	function startAdditiveSelection(event: PointerEvent) {
		setAreaState(Rect.from({ position: [event.clientX, event.clientY], size: 0 }))
	}

	function updateSelection(rect: Rect) {
		setAreaState(rect)
	}

	function endSelection() {
		setSelectedState(selected)
		setAreaState(undefined)
	}

	function setItemSelected(item: T, selected: boolean) {
		setSelectedState((items) => setPresentInSet(items, item, selected))
	}

	function clear() {
		setSelectedState(empty)
	}

	function isSelected(item: T) {
		return selected.has(item)
	}

	function registerHandle(handle: SelectableHandle<T>) {
		setHandles((current) => new Set(current).add(handle))
		return () => {
			setHandles((current) => {
				const next = new Set(current)
				next.delete(handle)
				return next
			})
		}
	}

	return {
		selected,
		area: areaState,
		startFreshSelection,
		startAdditiveSelection,
		updateSelection,
		endSelection,
		clear,
		setItemSelected,
		isSelected,
		registerHandle,
	}
}

export interface DragSelectAreaProps extends React.ComponentProps<"div"> {
	store: Pick<
		DragSelectStore<unknown>,
		"area" | "startFreshSelection" | "startAdditiveSelection" | "updateSelection" | "endSelection"
	>
}

export function DragSelectArea({ store, ...props }: DragSelectAreaProps) {
	return (
		<RectDrawArea
			{...props}
			rect={store.area}
			onInit={(event) => {
				if (event.ctrlKey) {
					store.startAdditiveSelection(event)
				} else {
					store.startFreshSelection(event)
				}
			}}
			onStart={store.updateSelection}
			onRectChange={store.updateSelection}
			onFinish={store.endSelection}
		/>
	)
}

export interface DragSelectableProps<V> extends React.ComponentProps<"div"> {
	item: V
	store: DragSelectStore<V>
}

export function DragSelectable<V>({ item, store, ...props }: DragSelectableProps<V>) {
	const ref = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		return store.registerHandle({
			item,
			overlaps(area) {
				return area.overlaps(Rect.from(expect(ref.current).getBoundingClientRect()))
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
					if (!event.ctrlKey) store.clear()
					store.setItemSelected(item, true)
				}
			}}
			data-selected={store.isSelected(item) || undefined}
		/>
	)
}
