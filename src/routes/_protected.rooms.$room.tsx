import { useParams } from "@remix-run/react"
import { useQuery } from "convex/react"
import { Heading, HeadingLevel } from "~/common/react/heading"
import { LoadingCover } from "~/components/LoadingCover.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { UserButton } from "~/features/auth/UserButton.tsx"
import { Battlemap } from "~/features/battlemap/Battlemap.tsx"
import { getImageUrl } from "~/features/images/getImageUrl.ts"
import { RoomContext, useRoomContext } from "~/features/rooms/context.tsx"
import { RoomInterfaceModules } from "~/features/rooms/RoomInterfaceModules.tsx"
import { heading } from "~/ui/styles.ts"

export default function RoomRoute() {
	const id = useParams().room as string
	const room = useQuery(api.rooms.get, { id })
	return (
		<>
			<style>{`
				:root {
					overflow: clip;
				}
			`}</style>
			{room && (
				<RoomContext value={room}>
					<title>{`${room.name} | Aspects VTT`}</title>
					<RoomBackground />
					<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-900" />
					<RoomInterface />
				</RoomContext>
			)}
			<LoadingCover visible={room === undefined} />
		</>
	)
}

function RoomInterface() {
	const room = useRoomContext()
	return (
		<div className="pointer-events-children absolute inset-0 flex h-screen w-screen flex-col p-3 gap-3">
			<HeadingLevel>
				<header className="pointer-events-children flex items-center justify-between">
					<Heading className={heading()}>AspectsVTT</Heading>
					<UserButton />
				</header>

				{room.activeSceneId && (
					<ActiveSceneHeading sceneId={room.activeSceneId} />
				)}

				<main className="pointer-events-children flex min-h-0 flex-1 items-stretch justify-between *:w-72">
					<RoomInterfaceModules />
				</main>
			</HeadingLevel>
		</div>
	)
}

function ActiveSceneHeading({ sceneId }: { sceneId: Id<"scenes"> }) {
	const activeScene = useQuery(api.scenes.get, { sceneId })
	return activeScene ? (
		<HeadingLevel>
			<div className="pointer-events-children absolute inset-x-0 top-6 flex flex-col items-center animate-in fade-in">
				<Heading className="text-3xl font-light">{activeScene.name}</Heading>
				<p className="text-xl font-light">Harvest 24th, 365 &bull; Evening</p>
				<p className="text-xl font-light">(weather)</p>
			</div>
		</HeadingLevel>
	) : null
}

function RoomBackground() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, { roomId: room._id })

	const activeScene = useQuery(
		api.scenes.get,
		room.activeSceneId ? { sceneId: room.activeSceneId } : "skip",
	)

	if (
		activeScene?.sceneryBackgroundId &&
		(activeScene.mode === "scenery" || !activeScene.battlemapBackgroundId)
	) {
		return (
			<img
				src={getImageUrl(activeScene.sceneryBackgroundId)}
				alt=""
				className="absolute inset-0 size-full object-cover"
				draggable={false}
			/>
		)
	}

	if (
		activeScene?.battlemapBackgroundId &&
		(activeScene.mode === "battlemap" || !activeScene.sceneryBackgroundId)
	) {
		return (
			<Battlemap
				scene={activeScene}
				characters={characters ?? []}
				backgroundUrl={getImageUrl(activeScene.battlemapBackgroundId)}
			/>
		)
	}

	return null
}
