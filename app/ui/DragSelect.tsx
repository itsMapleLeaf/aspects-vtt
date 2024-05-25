import * as React from "react"
import { Rect } from "../common/Rect.ts"
import { setPresentInSet } from "../common/collection.ts"
import { RectDrawArea } from "./RectDrawArea.tsx"

export type DragSelectStore<T> = ReturnType<typeof useDragSelectStore<T>>

const empty: ReadonlySet<never> = new Set()

export function useDragSelectStore<T>() {
	const [selectedState, setSelectedState] = React.useState<ReadonlySet<T>>(empty)
	const [areaState, setAreaState] = React.useState<Rect>()
	const [multiSelectState, setMultiSelectState] = React.useState<ReadonlySet<T>>(empty)
	const [elementRects] = React.useState(() => new Map<T, Rect>())

	const selected = new Set([...selectedState, ...multiSelectState])

	function startFreshSelection(event: PointerEvent) {
		startAdditiveSelection(event)
		setSelectedState(empty)
	}

	function startAdditiveSelection(event: PointerEvent) {
		setAreaState(Rect.from({ position: [event.clientX, event.clientY], size: 0 }))
		setMultiSelectState(empty)
	}

	function updateSelection(rect: Rect) {
		setAreaState(rect)
		setMultiSelectState(
			new Set(
				Iterator.from(elementRects)
					.filter(([_, elementRect]) => rect.overlaps(elementRect))
					.map(([item]) => item),
			),
		)
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

	function selectableRef(item: T, element: HTMLElement | null) {
		if (element) {
			const rect = Rect.from(element.getBoundingClientRect())
			elementRects.set(item, rect)
			return () => {
				elementRects.delete(item)
			}
		}
	}

	function areaProps() {
		return {
			rect: areaState,
			onInit: (event: PointerEvent) => {
				if (event.ctrlKey) {
					startAdditiveSelection(event)
				} else {
					startFreshSelection(event)
				}
			},
			onStart: updateSelection,
			onRectChange: updateSelection,
			onFinish: endSelection,
		}
	}

	function selectableProps(item: T) {
		return {
			ref: (element: HTMLElement | null) => selectableRef(item, element),
			"data-selected": isSelected(item) || undefined,
			onPointerDown: (event: React.PointerEvent) => {
				if (!isSelected(item) && event.buttons === 1) {
					if (!event.ctrlKey) clear()
					setItemSelected(item, true)
				}
			},
		}
	}

	return {
		selected,
		area: areaState,
		isSelected,
		areaProps,
		selectableProps,
		startFreshSelection,
		startAdditiveSelection,
		updateSelection,
		endSelection,
		clear,
		setItemSelected,
		selectableRef,
	}
}

export { RectDrawArea as DragSelectArea }
