import { Stage } from "react-konva"
import { useWindowSize } from "~/common/react/dom.ts"
import { Heading, HeadingLevel } from "~/common/react/heading.tsx"
import { useRoom } from "~/data.ts"
import { Avatar, AvatarFallback } from "~/ui/avatar.tsx"
import { Card, CardTitle } from "~/ui/card.tsx"
import { heading } from "~/ui/styles.ts"

export default function RoomRoute() {
	const room = useRoom()
	const [windowWidth, windowHeight] = useWindowSize()
	return (
		<>
			<Stage width={windowWidth} height={windowHeight}>
				{/* todo: stuff */}
			</Stage>
			<div className="absolute inset-0 flex flex-col p-3 gap-3">
				<HeadingLevel>
					<header className="flex items-center justify-between">
						<Heading className={heading()}>{room.name}</Heading>
						<button>
							<Avatar>
								<AvatarFallback>M</AvatarFallback>
							</Avatar>
						</button>
					</header>
					<main className="flex flex-1 items-stretch justify-between *:basis-64">
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
