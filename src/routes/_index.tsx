import { useQuery } from "convex/react"
import { Heading, HeadingLevel } from "~/common/react/heading.tsx"
import { LoadingCover } from "~/components/LoadingCover.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { Battlemap } from "~/features/battlemap/Battlemap.tsx"
import { RoomInterfaceModules } from "~/features/rooms/RoomInterfaceModules.tsx"
import { Avatar, AvatarFallback } from "~/ui/avatar.tsx"
import { heading } from "~/ui/styles.ts"

export default function RoomRoute() {
	const room = useQuery(api.entities.rooms.list)?.[0]
	return (
		<>
			{room && <RoomBackground roomId={room._id} />}
			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-900" />
			{room && <RoomInterface roomId={room._id} />}
			<LoadingCover visible={room === undefined} />
		</>
	)
}

function RoomInterface({ roomId }: { roomId: Id<"rooms"> }) {
	return (
		<div className="pointer-events-children absolute inset-0 flex flex-col p-3 gap-3">
			<HeadingLevel>
				<header className="pointer-events-children flex items-center justify-between">
					<Heading className={heading()}>AspectsVTT</Heading>
					<button>
						<Avatar>
							<AvatarFallback>M</AvatarFallback>
						</Avatar>
					</button>
					<ActiveSceneHeading roomId={roomId} />
				</header>

				<main className="pointer-events-children flex flex-1 items-stretch justify-between *:w-72">
					<RoomInterfaceModules roomId={roomId} />
				</main>
			</HeadingLevel>
		</div>
	)
}

function ActiveSceneHeading({ roomId }: { roomId: Id<"rooms"> }) {
	const activeScene = useQuery(api.entities.scenes.getActive, { roomId })
	return activeScene ?
			<HeadingLevel>
				<div className="pointer-events-children absolute inset-x-0 top-6 flex flex-col items-center animate-in fade-in">
					<Heading className="text-3xl font-light">{activeScene.name}</Heading>
					<p className="text-xl font-light">Harvest 24th, 365 &bull; Evening</p>
					<p className="text-xl font-light">(weather)</p>
				</div>
			</HeadingLevel>
		:	null
}

function RoomBackground({ roomId }: { roomId: Id<"rooms"> }) {
	const scenes = useQuery(
		api.entities.scenes.list,
		roomId ? { roomId } : "skip",
	)
	const characters = useQuery(
		api.entities.characters.list,
		roomId ? { roomId } : "skip",
	)
	const activeScene = scenes?.find((scene) => scene.isActive)

	if (
		activeScene?.sceneryBackgroundUrl &&
		(activeScene.mode === "scenery" || !activeScene.battlemapBackgroundUrl)
	) {
		return (
			<img
				src={activeScene.sceneryBackgroundUrl}
				alt=""
				className="absolute inset-0 size-full object-cover"
				draggable={false}
			/>
		)
	}

	if (
		activeScene?.battlemapBackgroundUrl &&
		(activeScene.mode === "battlemap" || !activeScene.sceneryBackgroundUrl)
	) {
		return (
			<Battlemap
				scene={activeScene}
				characters={characters ?? []}
				backgroundUrl={activeScene.battlemapBackgroundUrl}
			/>
		)
	}

	return null
}
