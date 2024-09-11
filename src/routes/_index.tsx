import { useQuery } from "convex/react"
import Konva from "konva"
import { Heading, HeadingLevel } from "~/common/react/heading.tsx"
import { api } from "~/convex/_generated/api.js"
import { Battlemap } from "~/features/battlemap/Battlemap.tsx"
import type { Character, Scene } from "~/types.ts"
import { Avatar, AvatarFallback } from "~/ui/avatar.tsx"
import { Card, CardTitle } from "~/ui/card.tsx"
import { heading } from "~/ui/styles.ts"

Konva.dragButtons = [0, 2]

export default function RoomRoute() {
	// const slug = useParams().room!
	const room = useQuery(api.entities.rooms.list)?.[0]

	const characters = useQuery(
		api.entities.characters.list,
		room ? { roomId: room._id } : "skip",
	)

	const scenes = useQuery(
		api.entities.scenes.list,
		room ? { roomId: room._id } : "skip",
	)

	const activeScene = scenes?.find((scene) => scene.isActive)

	if (room == null || characters == null || scenes == null) {
		return <div>Loading...</div>
	}

	const [draggingViewport, setDraggingViewport] = useState(false)

	return (
		<>
			<RoomBackground scenes={scenes} characters={characters} />

			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-900" />

			<div className="pointer-events-children absolute inset-0 flex flex-col p-3 gap-3">
				<HeadingLevel>
					<header className="pointer-events-children flex items-center justify-between">
						<Heading className={heading()}>{room.name}</Heading>
						<button>
							<Avatar>
								<AvatarFallback>M</AvatarFallback>
							</Avatar>
						</button>
						{activeScene && (
							<HeadingLevel>
								<div className="pointer-events-children absolute inset-x-0 top-6 flex flex-col items-center">
									<Heading className="text-3xl font-light">
										{activeScene.name}
									</Heading>
									<p className="text-xl font-light">
										Harvest 24th, 365 &bull; Evening
									</p>
									<p className="text-xl font-light">(weather)</p>
								</div>
							</HeadingLevel>
						)}
					</header>

					<main className="pointer-events-children flex flex-1 items-stretch justify-between *:basis-64">
						<nav className="flex flex-col gap" aria-label="Left sidebar">
							<Card className="flex-1">
								<CardTitle>Characters</CardTitle>
							</Card>
							<Card className="flex-1">
								<CardTitle>Notes</CardTitle>
							</Card>
						</nav>
						<nav className="flex flex-col gap" aria-label="Right sidebar">
							<Card className="flex-1">
								<CardTitle>Combat</CardTitle>
							</Card>
							<Card className="flex-1">
								<CardTitle>Messages</CardTitle>
							</Card>
						</nav>
					</main>
				</HeadingLevel>
			</div>
		</>
	)
}

function RoomBackground({
	scenes,
	characters,
}: {
	scenes: Scene[]
	characters: Character[]
}) {
	const activeScene = scenes.find((scene) => scene.isActive)

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
				characters={characters}
				backgroundUrl={activeScene.battlemapBackgroundUrl}
			/>
		)
	}

	return null
}
