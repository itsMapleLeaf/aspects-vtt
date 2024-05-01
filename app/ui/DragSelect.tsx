import { useGesture } from "@use-gesture/react"
import * as React from "react"
import { twMerge } from "tailwind-merge"
import { expect } from "../common/expect.ts"
import { Vector } from "../common/vector.ts"

type Area = {
	start: Vector
	end: Vector
}

const AreaContext = React.createContext<Area | undefined>(undefined)

export interface DragSelectAreaProps extends React.ComponentProps<"div"> {}

export function DragSelectArea({ children, ...props }: DragSelectAreaProps) {
	const [area, setArea] = React.useState<Area>()

	const bind = useGesture(
		{
			onPointerDown: (state) => {
				const xy = Vector.from(state.event.clientX, state.event.clientY)
				setArea({
					start: xy,
					end: xy,
				})
			},
			onDrag: (state) => {
				const xy = Vector.from(state.xy)
				setArea((area) => ({
					start: area?.start ?? xy,
					end: xy,
				}))
			},
			onDragEnd: (state) => {
				setArea(undefined)
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
			<AreaContext value={area}>{children}</AreaContext>
			{area && (
				<div
					className="absolute left-0 top-0 border-2 border-primary-600 bg-primary-600/25"
					style={getStyle(area)}
				/>
			)}
		</div>
	)
}

export interface DragSelectableProps extends React.ComponentProps<"div"> {}

export function DragSelectable(props: DragSelectableProps) {
	const area = React.use(AreaContext)
	const [selected, setSelected] = React.useState(false)
	const ref = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (!area) return

		const rect = expect(ref.current, "ref not set").getBoundingClientRect()
		const [start, end] = Vector.normalizeRange(area.start, area.end)
		setSelected(
			rect.left < end.x && rect.right > start.x && rect.top < end.y && rect.bottom > start.y,
		)
	}, [area])

	return <div {...props} ref={ref} data-selected={selected || undefined} />
}
