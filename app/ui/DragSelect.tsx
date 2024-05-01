import { useGesture } from "@use-gesture/react"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { expect } from "../common/expect.ts"
import { useEffectEvent } from "../common/react.ts"
import type { StrictOmit } from "../common/types.ts"
import { Vector } from "../common/vector.ts"

export type DragSelectStore<V> = ReturnType<typeof useDragSelectStore<V>>

export type Area = { start: Vector; end: Vector }

const empty: ReadonlySet<never> = new Set()

export function useDragSelectStore<T>() {
	const [selected, setSelected] = React.useState<ReadonlySet<T>>(empty)
	const [area, setArea] = React.useState<Area>()

	const setItemSelected = useEffectEvent(function setItemSelected(item: T, selected: boolean) {
		setSelected((items) => setPresentInSet(items, item, selected))
	})

	const clear = useEffectEvent(function clear() {
		setSelected(empty)
	})

	function isSelected(item: T) {
		return selected.has(item)
	}

	return { selected, area, setItemSelected, clear, setArea, isSelected }
}

type SelectableCallback = (area: Area) => void

const RegistryContext = React.createContext(new Set<SelectableCallback>())

export interface DragSelectAreaProps extends React.ComponentProps<"div"> {
	store: StrictOmit<DragSelectStore<unknown>, "setItemSelected" | "isSelected">
}

export function DragSelectArea({ store, children, ...props }: DragSelectAreaProps) {
	const [registry] = React.useState(() => new Set<SelectableCallback>())

	const bind = useGesture(
		{
			onPointerDown: (state) => {
				store.setArea(undefined)
				store.clear()
			},
			onDragStart: (state) => {
				const xy = Vector.from(state.xy)
				store.setArea({
					start: xy,
					end: xy,
				})
			},
			onDrag: (state) => {
				const xy = Vector.from(state.xy)
				store.setArea((area) => ({
					start: area?.start ?? xy,
					end: xy,
				}))
			},
			onDragEnd: (state) => {
				store.setArea(undefined)
			},
		},
		{
			drag: {
				threshold: 8,
				eventOptions: { passive: true },
			},
		},
	)

	function getStyle(area: Area): React.CSSProperties {
		const [start, end] = Vector.normalizeRange(area.start, area.end)
		return {
			translate: start.css.translate(),
			...end.minus(start).toSize(),
		}
	}

	return (
		<div {...props} className={twMerge("relative", props.className)}>
			<div {...bind()} className="absolute inset-0 touch-none" />
			<RegistryContext value={registry}>{children}</RegistryContext>
			{store.area && (
				<div
					className="absolute left-0 top-0 border-2 border-primary-600 bg-primary-600/25"
					style={getStyle(store.area)}
				/>
			)}
		</div>
	)
}

export interface DragSelectableProps<V> extends React.ComponentProps<"div"> {
	item: V
	store: DragSelectStore<V>
}

export function DragSelectable<V>({ item, store, ...props }: DragSelectableProps<V>) {
	const ref = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (!store.area) return
		const [start, end] = Vector.normalizeRange(store.area.start, store.area.end)
		const rect = expect(ref.current, "ref not set").getBoundingClientRect()
		store.setItemSelected(
			item,
			rect.left < end.x && rect.right > start.x && rect.top < end.y && rect.bottom > start.y,
		)
	}, [item, store.area, store.setItemSelected])

	return (
		<div
			{...props}
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

function toggleInSet<T>(set: ReadonlySet<T>, item: T): ReadonlySet<T> {
	const modified = new Set(set)
	if (set.has(item)) {
		modified.delete(item)
	} else {
		modified.add(item)
	}
	return modified
}

function setPresentInSet<T>(set: ReadonlySet<T>, item: T, present: boolean): ReadonlySet<T> {
	const modified = new Set(set)
	if (present) {
		modified.add(item)
	} else {
		modified.delete(item)
	}
	return modified
}
