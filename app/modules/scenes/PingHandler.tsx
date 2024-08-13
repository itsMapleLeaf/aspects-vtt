import { useMutation } from "convex/react"
import { type ComponentProps, startTransition, useRef } from "react"
import { Vector } from "../../../common/Vector.ts"
import { api } from "../../../convex/_generated/api"
import { useUser } from "../auth/hooks.ts"
import { queryMutators } from "../convex/helpers.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"

export function PingHandler(props: ComponentProps<"div">) {
	const room = useRoom()
	const context = useSceneContext()
	const user = useUser()

	const ping = useMutation(api.rooms.functions.ping).withOptimisticUpdate((store, args) => {
		for (const mutator of queryMutators(store, api.rooms.functions.get)) {
			if (mutator.value?._id === args.roomId && user) {
				mutator.set({
					...mutator.value,
					ping: {
						position: args.position,
						key: args.key,
						name: user.name,
						colorHue: user._creationTime % 360,
					},
				})
			}
		}
	})

	const handlePing = (event: { clientX: number; clientY: number }): void => {
		if (!user) return
		startTransition(() => {
			ping({
				roomId: room._id,
				position: context.mapPositionFromViewportPosition(event.clientX, event.clientY).xy,
				key: crypto.randomUUID(),
			})
		})
	}

	const ref = useLongPress(handlePing)

	return (
		<div
			{...props}
			ref={ref}
			onPointerDown={(event) => {
				if (event.button === 1) {
					event.preventDefault()
					handlePing(event)
				}
			}}
		/>
	)
}

function useLongPress(callback: (event: PointerEvent) => void) {
	const timeoutRef = useRef<number>(undefined)
	const movementRef = useRef(0)

	return (element: HTMLElement | null) => {
		if (!element) return

		const handleDown = (event: PointerEvent) => {
			timeoutRef.current = window.setTimeout(() => callback(event), 500)
			movementRef.current = 0
		}

		const handleMove = (event: PointerEvent) => {
			movementRef.current += Vector.fromEventMovement(event).length
			if (movementRef.current > 10) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = undefined
			}
		}

		const handleUp = () => {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = undefined
		}

		element.addEventListener("pointerdown", handleDown)
		window.addEventListener("pointermove", handleMove)
		window.addEventListener("pointerup", handleUp)
		window.addEventListener("pointercancel", handleUp)

		return () => {
			element.removeEventListener("pointerdown", handleDown)
			window.removeEventListener("pointermove", handleMove)
			window.removeEventListener("pointerup", handleUp)
			window.removeEventListener("pointercancel", handleUp)
		}
	}
}
