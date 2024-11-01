import { useConvex } from "convex/react"
import { LucideInfo } from "lucide-react"
import { startTransition, useRef, useState } from "react"
import { MenuPanel } from "~/components/Menu.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { useActiveSceneContext } from "~/features/scenes/context.ts"
import { ensure } from "~/shared/errors.ts"
import { Vec, VecInput } from "~/shared/vec.ts"

export function useTokenMapMenu() {
	const [open, setOpen] = useState(false)
	const [position, setPosition] = useState(Vec.from(0))
	const convex = useConvex()
	const scene = useActiveSceneContext()
	const room = useRoomContext()
	const justOpened = useRef(false)
	const [newTokenPosition, setNewTokenPosition] = useState(Vec.from(0))

	const [, createToken] = useToastAction(async (_state, _payload: void) => {
		await convex.mutation(api.tokens.create, {
			inputs: [
				{
					sceneId: ensure(scene, "where the scene at")._id,
					position: newTokenPosition.toJSON(),
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
				hideOnInteractOutside: () => {
					if (!justOpened.current) {
						return true
					}
					justOpened.current = false
					return false
				},
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
		show: (position: VecInput, newTokenPosition: VecInput) => {
			setOpen(true)
			setPosition(Vec.from(position))
			setNewTokenPosition(Vec.from(newTokenPosition))
			justOpened.current = true
		},
		element,
	}
}
