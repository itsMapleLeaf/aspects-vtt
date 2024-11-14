import * as Ariakit from "@ariakit/react"
import { useConvex, useQuery } from "convex/react"
import {
	LucideGrid2x2Plus,
	LucideInfo,
	LucideUserRoundPlus,
} from "lucide-react"
import { startTransition, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { MenuItem, MenuPanel, MenuProvider } from "~/components/Menu.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { useActiveSceneContext } from "~/features/scenes/context.ts"
import { ensure } from "~/lib/errors"
import { useNonNilFilter } from "~/lib/react/state.ts"
import { Vec, VecInput } from "~/lib/vec"
import { textInput } from "~/styles/input.ts"
import { panel } from "~/styles/panel.ts"
import { CharacterAvatar } from "../characters/CharacterAvatar.tsx"
import { CharacterName } from "../characters/CharacterName.tsx"
import { ApiCharacter } from "../characters/types.ts"

export function useMapBackdropMenu({
	onAddArea,
}: {
	onAddArea: (event: React.MouseEvent<HTMLDivElement>) => void
}) {
	const room = useRoomContext()
	const [open, setOpen] = useState(false)
	const [position, setPosition] = useState(Vec.from(0))
	const [newTokenPosition, setNewTokenPosition] = useState(Vec.from(0))
	const justOpened = useRef(false)
	const [, createToken] = useCreateTokenAction()

	const hideOnInteractOutside = () => {
		if (!justOpened.current) {
			return true
		}
		justOpened.current = false
		return false
	}

	const addActivityToken = () => {
		startTransition(() => {
			createToken({ position: newTokenPosition, characterId: null })
		})
	}

	const element = room.isOwner && (
		<MenuProvider open={open} setOpen={setOpen}>
			<MenuPanel
				getAnchorRect={() => position}
				hideOnInteractOutside={hideOnInteractOutside}
			>
				<MenuProvider>
					<MenuItem
						render={<Ariakit.MenuButton />}
						icon={<LucideUserRoundPlus />}
					>
						Add character...
					</MenuItem>
					<MenuPanel className={panel()}>
						<CharacterTokenSearchList newTokenPosition={newTokenPosition} />
					</MenuPanel>
				</MenuProvider>
				<MenuItem icon={<LucideGrid2x2Plus />} onClick={onAddArea}>
					Add area
				</MenuItem>
				<MenuItem icon={<LucideInfo />} onClick={addActivityToken}>
					Add activity
				</MenuItem>
			</MenuPanel>
		</MenuProvider>
	)

	return {
		show: (position: VecInput, newTokenPosition: VecInput) => {
			setOpen(true)
			setPosition(Vec.from(position))
			setNewTokenPosition(Vec.from(newTokenPosition))
			justOpened.current = true
		},
		element,
	}
}

function CharacterTokenSearchList({
	newTokenPosition,
}: {
	newTokenPosition: Vec
}) {
	const scene = useActiveSceneContext()
	const room = useRoomContext()
	const [search, setSearch] = useState("")

	const characters = useNonNilFilter(
		useQuery(api.characters.list, {
			roomId: room._id,
			search,
		}),
	)

	const tokens = useQuery(
		api.tokens.list,
		scene ? { sceneId: scene._id } : "skip",
	)

	const [, createToken] = useCreateTokenAction()

	return (
		<div className="flex h-96 flex-col gap-1">
			<input
				className={textInput()}
				value={search}
				onChange={(event) => setSearch(event.target.value)}
				placeholder="Search..."
			/>
			<div className="min-h-0 flex-1 overflow-y-auto">
				{(characters ?? [])
					.filter((it) => it.sceneId == scene?._id)
					.filter((it) =>
						tokens?.every((token) => token.characterId !== it._id),
					)
					.map((it) => (
						<form
							key={it._id}
							action={() => {
								createToken({ characterId: it._id, position: newTokenPosition })
							}}
							className="contents"
						>
							<CharacterTokenSearchListItem character={it} />
						</form>
					))}
			</div>
		</div>
	)
}

function CharacterTokenSearchListItem({
	character,
}: {
	character: ApiCharacter
}) {
	const status = useFormStatus()
	return (
		<MenuItem
			icon={
				status.pending ? (
					<LoadingIcon />
				) : (
					<CharacterAvatar character={character} />
				)
			}
			hideOnClick={false}
			render={<button type="submit" />}
			className={status.pending ? "opacity-50" : ""}
		>
			<CharacterName character={character} />
		</MenuItem>
	)
}

function useCreateTokenAction() {
	const convex = useConvex()
	const scene = useActiveSceneContext()
	return useToastAction(
		async (
			_state,
			{
				position,
				characterId,
			}: { position: Vec; characterId: Id<"characters"> | null },
		) => {
			const { _id: sceneId, cellSize } = ensure(scene, "where the scene at")
			await convex.mutation(api.tokens.create, {
				inputs: [
					{
						sceneId,
						characterId,
						position: position.minus(cellSize / 2).toJSON(),
					},
				],
			})
		},
	)
}
