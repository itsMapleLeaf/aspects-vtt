import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useActionState, type ComponentProps, type ReactNode } from "react"
import { api } from "../../../convex/_generated/api.js"
import { groupBy } from "../../common/collection.ts"
import { Loading } from "../../ui/Loading.tsx"
import { MoreMenu, MoreMenuItem, MoreMenuPanel } from "../../ui/MoreMenu.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { ToggleableSidebar } from "../../ui/ToggleableSidebar.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { panel, translucentPanel } from "../../ui/styles.ts"
import { RoomOwnerOnly, useCharacters, useRoom } from "../rooms/roomContext.tsx"
import { CharacterDnd } from "./CharacterDnd.tsx"
import { CharacterImage } from "./CharacterImage.tsx"
import { useCharacterModalContext } from "./CharacterModal.tsx"
import { useCharacterSelection } from "./CharacterSelectionProvider.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterListPanel() {
	const room = useRoom()
	const characters = useCharacters()

	const groups = groupBy(characters, (it) => {
		if (it.isOwner && !room.isOwner) return "self"
		if (it.playerId) return "player"
		return "rest"
	})

	function renderList(list: readonly ApiCharacter[]) {
		return list.map((character) => (
			<li key={character._id}>
				<CharacterTile character={character} />
			</li>
		))
	}

	const divider = (
		<li className="first:hidden last:hidden [&+&]:hidden">
			<hr className="border-primary-300" />
		</li>
	)

	return (
		<ToggleableSidebar name="Characters" side="left">
			<ScrollArea className={translucentPanel("h-full w-28 p-1")}>
				<ul className="flex h-full flex-col gap-2">
					<RoomOwnerOnly>
						<li>
							<CreateCharacterButton />
						</li>
					</RoomOwnerOnly>
					{renderList(groups.get("self") ?? [])}
					{divider}
					{renderList(groups.get("player") ?? [])}
					{divider}
					{renderList(
						(groups.get("rest") ?? []).toSorted((a, b) => b._creationTime - a._creationTime),
					)}
				</ul>
			</ScrollArea>
		</ToggleableSidebar>
	)
}

function CharacterTile({
	character,
	...props
}: { character: ApiCharacter } & ComponentProps<"button">) {
	const characterModal = useCharacterModalContext()
	const room = useRoom()

	const button = (
		<button
			type="button"
			{...props}
			className="flex w-full flex-col items-stretch gap-2 rounded-md p-1 transition hover:bg-primary-300/75"
			onClick={() => {
				characterModal.show(character._id)
			}}
		>
			<div className={panel("flex-center relative aspect-square overflow-clip")}>
				<CharacterImage
					character={character}
					className={{
						container: `size-full ${character.visible ? "" : "opacity-50"}`,
						image: "object-cover object-top",
					}}
				/>

				{character.visible ? null : <Lucide.EyeOff className="absolute size-8 opacity-50" />}
			</div>
			<p className="text-pretty text-center text-sm/none">{character.displayName}</p>
		</button>
	)

	return room.isOwner ?
			<CharacterMenu character={character}>
				<CharacterDnd.Draggable data={character} className="size-full">
					{button}
				</CharacterDnd.Draggable>
			</CharacterMenu>
		:	button
}

function CharacterMenu({ character, children }: { character: ApiCharacter; children: ReactNode }) {
	const room = useRoom()
	const removeCharacter = useMutation(api.characters.functions.remove)
	const duplicateCharacter = useMutation(api.characters.functions.duplicate)
	const selection = useCharacterSelection()

	return (
		<MoreMenu>
			{children}
			<MoreMenuPanel gutter={16}>
				{room.isOwner && (
					<>
						<MoreMenuItem
							text="Duplicate"
							icon={<Lucide.Copy />}
							onClick={async () => {
								const id = await duplicateCharacter({
									id: character._id,
									randomize: false,
								})
								selection.setSelected(id)
							}}
						/>
						<MoreMenuItem
							text="Duplicate (Randomized)"
							icon={<Lucide.Shuffle />}
							onClick={async () => {
								const id = await duplicateCharacter({
									id: character._id,
									randomize: true,
								})
								selection.setSelected(id)
							}}
						/>
						<MoreMenuItem
							text="Delete"
							icon={<Lucide.Trash />}
							onClick={() => {
								if (confirm(`Are you sure you want to remove "${character.displayName}"?`)) {
									removeCharacter({ id: character._id })
								}
							}}
						/>
					</>
				)}
			</MoreMenuPanel>
		</MoreMenu>
	)
}

function CreateCharacterButton() {
	const room = useRoom()
	const createCharacter = useMutation(api.characters.functions.create)
	const [, action, pending] = useActionState(async () => {
		const charadterId = await createCharacter({ roomId: room._id })
		characterModal.show(charadterId)
	}, undefined)
	const characterModal = useCharacterModalContext()

	return (
		<form action={action}>
			<Tooltip content="Create Character" placement="right">
				<button
					type="submit"
					className="flex-center aspect-square w-full opacity-75 transition-opacity hover:opacity-100"
				>
					{pending ?
						<Loading size="sm" />
					:	<Lucide.UserPlus2 className="size-8" />}
					<span className="sr-only">Create Character</span>
				</button>
			</Tooltip>
		</form>
	)
}
