import { useMutation, useQuery } from "convex/react"
import {
	LucideDoorOpen,
	LucideSidebarClose,
	LucideSidebarOpen,
} from "lucide-react"
import { ReactNode, useRef } from "react"
import { useSearchParams } from "react-router"
import { P, match } from "ts-pattern"
import { Button } from "~/components/Button.tsx"
import { LoadingCover } from "~/components/LoadingCover.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { UserButton } from "~/features/auth/UserButton.tsx"
import { TokenMap } from "~/features/battlemap/TokenMap.tsx"
import {
	BattleMapStageInfoContext,
	defaultStageInfo,
} from "~/features/battlemap/context.ts"
import { getImageUrl } from "~/features/images/getImageUrl.ts"
import { RoomPanels } from "~/features/rooms/RoomPanels.tsx"
import { RoomContext, useRoomContext } from "~/features/rooms/context.tsx"
import { ApiRoom } from "~/features/rooms/types.ts"
import {
	ActiveSceneContext,
	useActiveSceneContext,
} from "~/features/scenes/context.ts"
import { useLocalStorageSwitch } from "~/lib/react/dom.ts"
import { Heading, HeadingLevel } from "~/lib/react/heading"
import { primaryHeading, subText } from "~/styles/text.ts"
import type { Route } from "./+types._protected.rooms.$room.d.ts"

export default function RoomRoute({ params }: Route.ComponentProps) {
	return (
		<RoomRoot roomId={params.room}>
			<RoomBackground />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-900" />
			<RoomInterface />
		</RoomRoot>
	)
}

function RoomRoot({
	roomId,
	children,
}: {
	roomId: string
	children: ReactNode
}) {
	const room = useQuery(api.rooms.get, { id: roomId })
	const joined = useQuery(
		api.rooms.getJoined,
		room ? { roomId: room._id } : "skip",
	)
	const [searchParams] = useSearchParams()

	const activeSceneId =
		(room?.isOwner && (searchParams.get("scene") as Id<"scenes"> | null)) ||
		room?.activeSceneId

	const activeScene = useQuery(
		api.scenes.get,
		activeSceneId ? { sceneId: activeSceneId } : "skip",
	)

	const stageInfoRef = useRef(defaultStageInfo)

	const content = match({ room, joined })
		.with({ room: P.nonNullable, joined: true }, ({ room }) => (
			<RoomContext value={room}>
				<ActiveSceneContext value={activeScene}>
					<BattleMapStageInfoContext value={stageInfoRef}>
						<title>{`${room.name} | Aspects VTT`}</title>
						{children}
					</BattleMapStageInfoContext>
				</ActiveSceneContext>
			</RoomContext>
		))
		.with({ room: P.nonNullable, joined: false }, ({ room }) => (
			<JoinRoomMessage room={room} />
		))
		.with({ room: null }, () => <p>Room not found</p>)
		.otherwise(() => null)

	return (
		<>
			<style>{`
				:root {
					overflow: clip;
				}
			`}</style>
			{content}
			<LoadingCover visible={!content} />
		</>
	)
}

function JoinRoomMessage({ room }: { room: ApiRoom }) {
	const joinRoom = useMutation(api.rooms.join)
	return (
		<div className="absolute inset-0 flex flex-col *:m-auto">
			<main className="flex flex-col items-center text-balance p-4 text-center">
				<p className="mb-4 text-xl">You have been invited to</p>
				<h1 className={primaryHeading("mb-5 text-3xl")}>{room.name}</h1>
				<ToastActionForm
					action={async () => joinRoom({ roomId: room._id })}
					className="contents"
				>
					<Button type="submit" icon={<LucideDoorOpen />}>
						Join room
					</Button>
				</ToastActionForm>
			</main>
		</div>
	)
}

function RoomInterface() {
	const room = useRoomContext()

	const [leftSidebarOpen, leftSidebarActions] = useLocalStorageSwitch(
		"leftSidebarOpen",
		true,
	)
	const [rightSidebarOpen, rightSidebarActions] = useLocalStorageSwitch(
		"rightSidebarOpen",
		true,
	)

	return (
		<div className="pointer-events-children absolute inset-0 flex h-screen w-screen flex-col p-3 gap-3">
			<HeadingLevel>
				<header className="pointer-events-children flex items-center justify-between">
					<div className="flex gap">
						<Button
							appearance="clear"
							icon={
								leftSidebarOpen ? <LucideSidebarClose /> : <LucideSidebarOpen />
							}
							tooltip={
								leftSidebarOpen ? "Hide left sidebar" : "Show left sidebar"
							}
							onClick={leftSidebarActions.toggle}
						/>
						<Heading>
							<div className={subText()}>AspectsVTT</div>
							<div className={primaryHeading("-mt-1")}>{room.name}</div>
						</Heading>
					</div>
					<div className="flex gap">
						<UserButton />
						<Button
							appearance="clear"
							icon={
								rightSidebarOpen ? (
									<LucideSidebarClose className="-scale-x-100" />
								) : (
									<LucideSidebarOpen className="-scale-x-100" />
								)
							}
							tooltip={
								rightSidebarOpen ? "Hide right sidebar" : "Show right sidebar"
							}
							onClick={rightSidebarActions.toggle}
						/>
					</div>
				</header>

				<SceneHeading />

				<main className="pointer-events-children flex min-h-0 flex-1 items-stretch justify-between *:w-72">
					<RoomPanels
						leftSidebarOpen={leftSidebarOpen}
						rightSidebarOpen={rightSidebarOpen}
					/>
				</main>
			</HeadingLevel>
		</div>
	)
}

function SceneHeading() {
	const scene = useActiveSceneContext()
	return scene ? (
		<HeadingLevel>
			<div className="pointer-events-children absolute inset-x-0 top-6 flex flex-col items-center animate-in fade-in">
				<Heading className="text-3xl font-light">{scene.name}</Heading>
				{/* <p className="text-xl font-light">Harvest 24th, 365 &bull; Evening</p>
            <p className="text-xl font-light">(weather)</p> */}
			</div>
		</HeadingLevel>
	) : null
}

function RoomBackground() {
	const activeScene = useActiveSceneContext()

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
		return <TokenMap scene={activeScene} />
	}

	return null
}
