import { useConvex } from "convex/react"
import { LucideInfo } from "lucide-react"
import { startTransition, useRef, useState } from "react"
import { MenuPanel } from "~/components/Menu.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { useBattleMapStageInfo } from "~/features/battlemap/context.ts"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { useActiveSceneContext } from "~/features/scenes/context.ts"
import { ensure } from "~/shared/errors.ts"
import { Vec } from "~/shared/vec.ts"

export function useTokenMapMenu() {
	const pointerDownPositionRef = useRef(Vec.from(0))
	const [open, setOpen] = useState(false)
	const [position, setPosition] = useState(Vec.from(0))
	const convex = useConvex()
	const scene = useActiveSceneContext()
	const stageInfo = useBattleMapStageInfo()
	const room = useRoomContext()

	const [, createToken] = useToastAction(async (_state, _payload: void) => {
		await convex.mutation(api.tokens.create, {
			inputs: [
				{
					sceneId: ensure(scene, "where the scene at")._id,
					position: stageInfo.current.getViewportCenter(),
				},
			],
		})
	})

	const element = room.isOwner && (
		<MenuPanel
			open={open}
			setOpen={setOpen}
			menuProps={{
				getAnchorRect: () => position,
			}}
			options={[
				{
					label: "Add activity token",
					icon: <LucideInfo />,
					onClick: () => {
						startTransition(() => {
							createToken()
						})
					},
				},
			]}
		/>
	)

	return {
		handlePointerDown: (event: PointerEvent) => {
			if (event.button === 2) {
				pointerDownPositionRef.current = Vec.from(event)
			}
		},
		handleContextMenu: (event: { x: number; y: number }) => {
			// since there's no way to know if this is the end of a drag vs. a simple right click,
			// we need to check that the cursor didn't move too far away since pointer down
			if (pointerDownPositionRef.current.distanceTo(event) < 10) {
				setOpen(true)
				setPosition(Vec.from(event))
			}
		},
		element,
	}
}
