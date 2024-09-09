import {
	DndContext,
	DragEndEvent,
	MouseSensor,
	pointerWithin,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core"
import { ReactNode } from "react"
import * as v from "valibot"
import { PanelLocation, panelLocationSchema } from "../types.ts"

export function PanelDndContext({
	children,
	onMovePanel,
}: {
	children: ReactNode
	onMovePanel: (panelId: string, location: PanelLocation) => void
}) {
	function handleDragEnd(event: DragEndEvent) {
		if (!event.over) return

		const data = v.parse(panelLocationSchema, event.over?.data.current)
		onMovePanel(event.active.id as string, data)
	}

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: 10 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 5 },
		}),
	)

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={pointerWithin}
			onDragEnd={handleDragEnd}
		>
			{children}
		</DndContext>
	)
}
