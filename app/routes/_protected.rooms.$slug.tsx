import { useQuery } from "convex/react"
import { Suspense, useCallback, useEffect, useRef } from "react"
import { CharacterSelectionProvider } from "~/modules/characters/CharacterSelectionProvider.tsx"
import { CombatTurnBanner } from "~/modules/combat/CombatTurnBanner.tsx"
import { GameTime } from "~/modules/game/GameTime.tsx"
import { MessageInput } from "~/modules/messages/MessageInput.tsx"
import { MessageList } from "~/modules/messages/MessageList.tsx"
import { ResourceList } from "~/modules/resources/ResourceList.tsx"
import { useRoom } from "~/modules/rooms/roomContext.tsx"
import { RoomToolbar } from "~/modules/rooms/RoomToolbar.tsx"
import { RoomToolbarStore } from "~/modules/rooms/RoomToolbarStore.tsx"
import { SceneProvider } from "~/modules/scenes/SceneContext.tsx"
import { SceneMap } from "~/modules/scenes/SceneMap.tsx"
import { AppHeader } from "~/ui/AppHeader.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { TranslucentPanel } from "~/ui/Panel.tsx"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { api } from "../../convex/_generated/api.js"

export default function RoomRoute() {
	return (
		<CharacterSelectionProvider>
			<Suspense>
				<RoomTimedThemeEffect />
			</Suspense>

			<RoomToolbarStore.Provider>
				<div className="fixed inset-0 select-none overflow-clip bg-primary-100">
					<Suspense fallback={<Loading fill="parent" />}>
						<SceneProvider>
							<SceneMap />
						</SceneProvider>
					</Suspense>
				</div>

				<div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-40 bg-natural-gradient-100">
					<div className="absolute inset-x-0 top-0 flex flex-col justify-center p-4 [&_:is(a,button)]:pointer-events-auto">
						<AppHeader />
					</div>
					<div className="flex-center absolute inset-x-0 top-6"></div>
					<SceneHeading />
					<CombatTurnBanner />
				</div>

				<div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-screen items-end gap-2 overflow-clip p-2">
					<div className="h-[calc(100%-4rem)] min-h-0 flex-1">
						<TranslucentPanel className="pointer-events-auto h-full w-64 gap-2 p-2">
							<ResourceList />
						</TranslucentPanel>
					</div>

					<TranslucentPanel className="pointer-events-auto flex flex-col items-center gap-2 p-2">
						<RoomToolbar />
					</TranslucentPanel>

					<div className="flex h-full min-h-0 flex-1 flex-col items-end justify-end">
						<div className="flex min-h-0 flex-1 flex-col justify-end">
							<MessageListScroller />
						</div>
						<div className="flex w-[20rem] flex-col gap-2">
							<TranslucentPanel element={<aside />} className="pointer-events-auto gap-2 p-2">
								<MessageInput />
							</TranslucentPanel>
						</div>
					</div>
				</div>
			</RoomToolbarStore.Provider>
		</CharacterSelectionProvider>
	)
}

function RoomTimedThemeEffect() {
	const room = useRoom()
	const gameTime = new GameTime(room.gameTime)
	const themeColor = [
		145, // daytime
		70, // evening
		305, // night
	][gameTime.timeOfDay]

	useEffect(() => {
		if (themeColor !== undefined) {
			document.body.style.setProperty("--theme-hue", String(themeColor))
		}
	}, [themeColor])

	useEffect(() => {
		return () => {
			document.body.style.removeProperty("--theme-hue")
		}
	}, [])

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
		<ScrollArea
			className="pointer-events-auto -mr-2 w-[21rem]"
			viewportRef={viewportRef}
			scrollbarPosition="inside"
		>
			<div className="p-2">
				<MessageList onMessageAdded={handleMessageAdded} />
			</div>
		</ScrollArea>
	)
}

function SceneHeading() {
	const room = useRoom()
	const scene = useQuery(api.scenes.functions.getCurrent, { roomId: room._id })
	const gameTime = new GameTime(room.gameTime)
	if (!scene) return
	return (
		<h2 className="pointer-events-none fixed inset-x-0 top-3 mx-auto max-w-sm select-none text-pretty p-4 text-center text-2xl font-light tracking-wide text-primary-900/90 drop-shadow-[0px_0px_3px_rgba(0,0,0,0.9)]">
			{scene.name}
			<p className="text-base font-medium tracking-wide">
				{gameTime.timeOfDayName} - Day {gameTime.day + 1} of {gameTime.monthName.name}, Year{" "}
				{gameTime.year + 1}
			</p>
		</h2>
	)
}
