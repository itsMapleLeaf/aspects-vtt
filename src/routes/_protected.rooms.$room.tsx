import { useParams } from "@remix-run/react"
import { useMutation, useQuery } from "convex/react"
import {
	LucideDoorOpen,
	LucideSidebarClose,
	LucideSidebarOpen,
} from "lucide-react"
import { useRef } from "react"
import { match, P } from "ts-pattern"
import { Heading, HeadingLevel } from "~/common/react/heading"
import { Button } from "~/components/Button.tsx"
import { LoadingCover } from "~/components/LoadingCover.tsx"
import { ToastActionForm } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import type { Id } from "~/convex/_generated/dataModel.js"
import { UserButton } from "~/features/auth/UserButton.tsx"
import { Battlemap } from "~/features/battlemap/Battlemap.tsx"
import {
	BattleMapStageInfoContext,
	defaultStageInfo,
} from "~/features/battlemap/context.ts"
import { getImageUrl } from "~/features/images/getImageUrl.ts"
import { RoomContext, useRoomContext } from "~/features/rooms/context.tsx"
import { RoomInterfaceModules } from "~/features/rooms/RoomInterfaceModules.tsx"
import { ApiRoom } from "~/features/rooms/types.ts"
import { ActiveSceneContext } from "~/features/scenes/context.ts"
import { primaryHeading, subText } from "~/styles/text.ts"
import { useLocalStorageSwitch } from "../common/react/dom.ts"

export default function RoomRoute() {
	return (
		<RoomRoot>
			<RoomBackground />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-900" />
			<RoomInterface />
		</RoomRoot>
	)
}

function RoomRoot({ children }: { children: React.ReactNode }) {
	const id = useParams().room as string
	const room = useQuery(api.rooms.get, { id })
	const joined = useQuery(
		api.rooms.getJoined,
		room ? { roomId: room._id } : "skip",
	)
	const activeScene = useQuery(
		api.scenes.get,
		room?.activeSceneId ? { sceneId: room.activeSceneId } : "skip",
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

				{room.activeSceneId && <SceneHeading sceneId={room.activeSceneId} />}

				<main className="pointer-events-children flex min-h-0 flex-1 items-stretch justify-between *:w-72">
					<RoomInterfaceModules
						leftSidebarOpen={leftSidebarOpen}
						rightSidebarOpen={rightSidebarOpen}
					/>
				</main>
			</HeadingLevel>
		</div>
	)
}

function SceneHeading({ sceneId }: { sceneId: Id<"scenes"> }) {
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
				backgroundUrl={getImageUrl(activeScene.battlemapBackgroundId)}
			/>
		)
	}

	return null
}
