import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { type ComponentProps, type ReactNode, useEffect } from "react"
import { twMerge } from "tailwind-merge"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel.js"
import { groupBy } from "../../common/collection.ts"
import { useMutationAction } from "../../common/convex.ts"
import { useEffectEvent } from "../../common/react.ts"
import { Loading } from "../../ui/Loading.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../../ui/Menu.tsx"
import { ModalButton } from "../../ui/Modal.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { ToggleableSidebar } from "../../ui/ToggleableSidebar.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { panel, translucentPanel } from "../../ui/styles.ts"
import { UploadedImage } from "../images/UploadedImage.tsx"
import { RoomOwnerOnly, useCharacters, useRoom } from "../rooms/roomContext.tsx"
import { CharacterDnd } from "./CharacterDnd.tsx"
import { CharacterModal } from "./CharacterModal.tsx"
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
			<ScrollArea className={translucentPanel("h-full w-28 p-2")}>
				<ul className="flex h-full flex-col gap-3">
					<RoomOwnerOnly>
						<li>
							<CreateCharacterButton />
						</li>
					</RoomOwnerOnly>
					{renderList(groups.get("self") ?? [])}
					{divider}
					{renderList(groups.get("player") ?? [])}
					{divider}
					{renderList(groups.get("rest") ?? [])}
				</ul>
			</ScrollArea>
		</ToggleableSidebar>
	)
}

function CharacterTile({
	character,
	...props
}: { character: ApiCharacter } & ComponentProps<"button">) {
	const selection = useCharacterSelection()
	return (
		<CharacterMenu character={character}>
			<MenuButton
				className={twMerge(
					"flex w-full flex-col items-stretch gap-2 transition-opacity",
					selection.selectedCharacter?._id === character._id
						? "text-primary-700"
						: "opacity-75 hover:opacity-100",
				)}
				{...props}
			>
				<div className={panel("overflow-clip aspect-square relative flex-center")}>
					<CharacterDnd.Draggable data={character} className="size-full">
						<UploadedImage
							id={character.imageId}
							emptyIcon={<Lucide.Ghost />}
							className={{
								container: `size-full ${character.visible ? "" : "opacity-50"}`,
								image: "object-cover object-top",
							}}
						/>
					</CharacterDnd.Draggable>
					{character.visible ? null : <Lucide.EyeOff className="absolute size-8 opacity-50" />}
				</div>
				<p className="text-pretty text-center text-sm/none">{character.displayName}</p>
			</MenuButton>
		</CharacterMenu>
	)
}

function CharacterMenu({ character, children }: { character: ApiCharacter; children: ReactNode }) {
	const room = useRoom()
	const removeCharacter = useMutation(api.characters.remove)
	const duplicateCharacter = useMutation(api.characters.duplicate)
	const selection = useCharacterSelection()

	return (
		<Menu placement="right">
			{children}
			<MenuPanel gutter={16} unmountOnHide={false}>
				<CharacterModal character={character}>
					<ModalButton render={<MenuItem text="Profile" icon={<Lucide.BookUser />} />} />
				</CharacterModal>
				{room.isOwner && (
					<>
						<MenuItem
							text="Duplicate"
							icon={<Lucide.Copy />}
							onClick={async () => {
								const id = await duplicateCharacter({ id: character._id, randomize: false })
								selection.setSelected(id)
							}}
						/>
						<MenuItem
							text="Duplicate (Randomized)"
							icon={<Lucide.Shuffle />}
							onClick={async () => {
								const id = await duplicateCharacter({ id: character._id, randomize: true })
								selection.setSelected(id)
							}}
						/>
						<MenuItem
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
			</MenuPanel>
		</Menu>
	)
}

function CreateCharacterButton() {
	const room = useRoom()
	const [createdId, submit, pending] = useMutationAction(api.characters.create)
	const selection = useCharacterSelection()

	const handleCreated = useEffectEvent((id: Id<"characters">) => {
		selection.setSelected(id)
	})

	useEffect(() => {
		if (createdId) handleCreated(createdId)
	}, [createdId, handleCreated])

	return (
		<form action={() => submit({ roomId: room._id })}>
			<Tooltip content="Create Character" placement="right">
				<button
					type="submit"
					className="flex-center aspect-square w-full opacity-75 transition-opacity hover:opacity-100"
				>
					{pending ? <Loading size="sm" /> : <Lucide.UserPlus2 className="size-8" />}
					<span className="sr-only">Create Character</span>
				</button>
			</Tooltip>
		</form>
	)
}
