import { useMutation } from "convex/react"
import { Suspense, useCallback, useEffect, useRef } from "react"
import { CombatInitiativePanel } from "~/modules/combat/CombatInitiative.tsx"
import { CombatTurnBanner } from "~/modules/combat/CombatTurnBanner.tsx"
import { GameTime } from "~/modules/game/GameTime.tsx"
import { MessageInput } from "~/modules/messages/MessageInput.tsx"
import { MessageList } from "~/modules/messages/MessageList.tsx"
import { ResourceTree } from "~/modules/resources/ResourceTree.tsx"
import { RoomToolbar } from "~/modules/rooms/RoomToolbar.tsx"
import { useRoomToolbarStore } from "~/modules/rooms/RoomToolbarStore.ts"
import { useRoom } from "~/modules/rooms/roomContext.tsx"
import { SceneProvider } from "~/modules/scenes/SceneContext.tsx"
import { SceneHeading } from "~/modules/scenes/SceneHeading.tsx"
import { SceneMap } from "~/modules/scenes/SceneMap.tsx"
import { useSelectedScene } from "~/modules/scenes/hooks.ts"
import { AppHeader } from "~/ui/AppHeader.tsx"
import { AutoAnimate } from "~/ui/AutoAnimate.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { TranslucentPanel } from "~/ui/Panel.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { api } from "../../../convex/_generated/api.js"

export function RoomPage() {
	const store = useRoomToolbarStore()
	const scene = useSelectedScene()
	return (
		<>
			<Suspense>
				<JoinRoomEffect />
				<RoomTimedThemeEffect />
			</Suspense>

			<div className="fixed inset-0 select-none overflow-clip bg-primary-900">
				<Suspense fallback={<Loading fill="parent" />}>
					<SceneProvider>
						<SceneMap store={store} />
					</SceneProvider>
				</Suspense>
			</div>

			<div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-40 bg-natural-gradient-900">
				<div className="absolute inset-x-0 top-0 flex flex-col justify-center p-4 [&_:is(a,button)]:pointer-events-auto">
					<AppHeader />
				</div>
				<Suspense>
					<SceneHeading />
				</Suspense>
				<Suspense>
					<CombatTurnBanner />
				</Suspense>
			</div>

			<div className="pointer-events-none absolute inset-0 flex h-screen items-end overflow-clip p-2 gap-2">
				<AutoAnimate className="flex h-[calc(100%-4rem)] min-h-0 flex-1 flex-col gap-2">
					<TranslucentPanel className="pointer-events-auto flex min-h-0 w-[18rem] flex-1 flex-col p-2 gap-2">
						<Suspense fallback={<Loading fill="parent" />}>
							<ResourceTree sceneId={scene?._id} />
						</Suspense>
					</TranslucentPanel>

					<CombatInitiativePanel className="pointer-events-auto w-[18rem]" />
				</AutoAnimate>

				<TranslucentPanel className="pointer-events-auto flex flex-col items-center p-2 gap-2">
					<Suspense>
						<RoomToolbar store={store} />
					</Suspense>
				</TranslucentPanel>

				<div className="flex h-full min-h-0 flex-1 flex-col items-end">
					<div className="flex h-full min-h-0 w-[20rem] flex-1 flex-col">
						<Suspense fallback={<Loading fill="parent" />}>
							<div className="flex min-h-0 flex-1 flex-col justify-end">
								<MessageListScroller />
							</div>
							<div className="flex flex-col gap-2">
								<TranslucentPanel
									element={<aside />}
									className="pointer-events-auto p-2 gap-2"
								>
									<MessageInput />
								</TranslucentPanel>
							</div>
						</Suspense>
					</div>
				</div>
			</div>
		</>
	)
}

function JoinRoomEffect() {
	const room = useRoom()
	const join = useMutation(api.rooms.functions.join)

	useEffect(() => {
		if (!room.isJoined) join({ id: room._id })
	}, [join, room._id, room.isJoined])

	return room.isJoined && <div data-room-joined hidden />
}

function RoomTimedThemeEffect() {
	const room = useRoom()
	const gameTime = new GameTime(room.gameTime)

	const themeClass =
		gameTime.timeOfDayName === "Daytime" ? "theme-daytime"
		: gameTime.timeOfDayName === "Evening" ? "theme-evening"
		: gameTime.timeOfDayName === "Night" ? "theme-night"
		: "theme-default"

	// biome-ignore lint/correctness/useExhaustiveDependencies: only want to react to time changes
	useEffect(() => {
		document.body.classList.add("theme-transition")
		const timeout = setTimeout(
			() => document.body.classList.remove("theme-transition"),
			500,
		)
		return () => {
			clearTimeout(timeout)
			document.body.classList.remove("theme-transition")
		}
	}, [themeClass])

	useEffect(() => {
		document.body.classList.add(themeClass)
		return () => document.body.classList.remove(themeClass)
	}, [themeClass])

	return null
}

function MessageListScroller() {
	const viewportRef = useRef<HTMLDivElement>(null)

	const handleMessageAdded = useCallback(() => {
		const viewport = viewportRef.current
		if (!viewport) return

		setTimeout(() => {
			viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
		}, 300) // wait for
	}, [])

	return (
		<div className="-mx-2 h-full">
			<ScrollArea
				className="pointer-events-auto"
				viewportRef={viewportRef}
				scrollbarPosition="inside"
			>
				<div className="p-2">
					<MessageList onMessageAdded={handleMessageAdded} />
				</div>
			</ScrollArea>
		</div>
	)
}
