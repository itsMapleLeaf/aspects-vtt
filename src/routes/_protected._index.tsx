import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { LucideDoorOpen } from "lucide-react"
import { NavLink } from "react-router"
import { AppHeader } from "~/components/AppHeader.tsx"
import { EmptyState } from "~/components/EmptyState.tsx"
import Grid from "~/components/Grid.tsx"
import { Heading, HeadingLevel } from "~/components/Heading.tsx"
import { ImageCard } from "~/components/ImageCard.tsx"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { api } from "~/convex/_generated/api"
import { CreateRoomButton } from "~/features/rooms/CreateRoomButton"
import { interactivePanel } from "~/styles/panel.ts"

export default function IndexRoute() {
	const rooms = useQuery(api.rooms.list)

	return (
		<>
			<AppHeader />
			<HeadingLevel>
				<header className="container flex justify-between">
					<Heading className="heading-3xl mb-2">Your rooms</Heading>
					<CreateRoomButton />
				</header>
				<main className="container">
					{rooms === undefined ? (
						<LoadingIcon />
					) : rooms.length === 0 ? (
						<EmptyState
							icon={<LucideDoorOpen />}
							text="You don't have any rooms yet."
						/>
					) : (
						<Grid>
							{rooms.map((room) => (
								<RoomCard key={room._id} room={room} />
							))}
						</Grid>
					)}
				</main>
			</HeadingLevel>
		</>
	)
}

interface RoomCardProps {
	room: FunctionReturnType<typeof api.rooms.list>[0]
}

function RoomCard({ room }: RoomCardProps) {
	return (
		<NavLink to={`/rooms/${room.slug}`}>
			{({ isPending }) => (
				<ImageCard
					title={room.name}
					imageUrl={room.previewUrl}
					className={interactivePanel()}
					pending={isPending}
				/>
			)}
		</NavLink>
	)
}
