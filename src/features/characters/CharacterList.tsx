import { useNavigate } from "@remix-run/react"
import { useMutation } from "convex/react"
import {
	LucideCopy,
	LucideEdit,
	LucideTrash,
	LucideUserPlus,
	LucideUserRoundX,
	LucideX,
} from "lucide-react"
import { useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import { Id } from "../../../convex/_generated/dataModel"
import { EMPTY_ARRAY, hasLength } from "../../lib/array.ts"
import { useStableQuery } from "../../lib/convex.tsx"
import { setToggle } from "../../lib/set.ts"
import { typed } from "../../lib/types.ts"
import { ActionRow, ActionRowItem } from "../../ui/ActionRow.tsx"
import { EmptyState } from "../../ui/empty-state.tsx"
import { FormButton } from "../../ui/FormButton.tsx"
import { Modal, ModalPanel } from "../../ui/modal.tsx"
import { PressEvent } from "../../ui/Pressable.tsx"
import { SearchableList } from "../../ui/SearchableList.tsx"
import { Selectable } from "../../ui/Selectable.tsx"
import { clearButton, errorText } from "../../ui/styles.ts"
import { ToastActionForm } from "../../ui/toast.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { CharacterEditorForm } from "./CharacterEditorForm"
import { CharacterListCard } from "./CharacterListCard"
import { ApiCharacter } from "./types.ts"

export function CharacterList({ roomId }: { roomId: Id<"rooms"> }) {
	const navigate = useNavigate()

	const [state, setState] = useState({
		search: "",
		selectedCharacterIds: typed<ReadonlySet<Id<"characters">>>(
			new Set<Id<"characters">>(),
		),
		lastSelectedCharacterId: typed<Id<"characters"> | null>(null),
		characterEditorOpen: false,
		characterEditorCharacterId: typed<Id<"characters"> | null>(null),
	})

	const characters =
		useStableQuery(api.functions.characters.list, {
			roomId,
			search: state.search,
		}) ?? EMPTY_ARRAY

	const createCharacter = useMutation(api.functions.characters.create)
	const updateCharacter = useMutation(api.functions.characters.update)
	const removeCharacters = useMutation(api.functions.characters.remove)
	const duplicateCharacters = useMutation(api.functions.characters.duplicate)

	const characterEditorCharacter = characters.find(
		(character) => character._id === state.characterEditorCharacterId,
	)

	const selectedCharacters = characters.filter((character) =>
		state.selectedCharacterIds.has(character._id),
	)

	const setSearch = (search: string) => {
		setState((current) => ({ ...current, search }))
	}

	const openCharacterEditor = (characterId: ApiCharacter["_id"]) => {
		setState((current) => ({
			...current,
			characterEditorOpen: true,
			characterEditorCharacterId: characterId,
		}))
	}

	const setCharacterEditorOpen = (open: boolean) => {
		setState((current) => ({ ...current, characterEditorOpen: open }))
	}

	const clearSelection = () => {
		setState((current) => ({
			...current,
			selectedCharacterIds: new Set<Id<"characters">>(),
		}))
	}

	const handleCharacterPress = (character: ApiCharacter, event: PressEvent) => {
		if (event.ctrlKey) {
			setState((current) => ({
				...current,
				selectedCharacterIds: setToggle(
					current.selectedCharacterIds,
					character._id,
				),
			}))
			return
		}

		if (event.shiftKey) {
			const lastSelectedIndex = characters.findIndex(
				(character) => character._id === state.lastSelectedCharacterId,
			)
			const selectedIndex = characters.findIndex(
				(character) => character._id === character._id,
			)
			setState((current) => ({
				...current,
				selectedCharacterIds: new Set(
					characters
						.slice(
							Math.min(lastSelectedIndex, selectedIndex),
							Math.max(lastSelectedIndex, selectedIndex) + 1,
						)
						.map((character) => character._id),
				),
			}))
			return
		}

		if (state.selectedCharacterIds.has(character._id)) {
			openCharacterEditor(character._id)
			return
		}

		setState((current) => ({
			...current,
			selectedCharacterIds: new Set([character._id]),
			lastSelectedCharacterId: character._id,
		}))
	}

	return (
		<div className="relative flex h-full flex-col gap-3">
			<div className="flex-1">
				<SearchableList
					search={state.search}
					onSearchChange={setSearch}
					items={characters}
					renderItem={(character) => (
						<Selectable
							active={state.selectedCharacterIds.has(character._id)}
							onPress={(event) => handleCharacterPress(character, event)}
						>
							<CharacterListCard character={character} />
						</Selectable>
					)}
					actions={
						<ToastActionForm
							message="Creating character..."
							action={async () => {
								const character = await createCharacter({
									roomId,
								})
								openCharacterEditor(character)
							}}
						>
							<FormButton className={clearButton()}>
								<LucideUserPlus />
								<span className="sr-only">Create character</span>
							</FormButton>
						</ToastActionForm>
					}
				/>
			</div>

			{selectedCharacters.length > 0 && (
				<ActionRow className="flex gap-1 *:flex-1">
					{hasLength(selectedCharacters, 1) && (
						<>
							<ActionRowItem
								icon={<LucideEdit />}
								onClick={() => openCharacterEditor(selectedCharacters[0]._id)}
							>
								Edit
							</ActionRowItem>
						</>
					)}

					<ActionRowItem
						icon={<LucideCopy />}
						onClick={() =>
							duplicateCharacters({
								characterIds: selectedCharacters.map(
									(character) => character._id,
								),
							})
						}
					>
						Clone
					</ActionRowItem>

					<ActionRowItem icon={<LucideX />} onClick={clearSelection}>
						Dismiss
					</ActionRowItem>

					<ToastActionForm
						message="Deleting character(s)..."
						action={() => {
							return removeCharacters({
								characterIds: selectedCharacters.map(
									(character) => character._id,
								),
							})
						}}
					>
						<ActionRowItem
							type="submit"
							icon={<LucideTrash />}
							className={errorText()}
						>
							Delete
						</ActionRowItem>
					</ToastActionForm>
				</ActionRow>
			)}

			<Modal open={state.characterEditorOpen} setOpen={setCharacterEditorOpen}>
				<ModalPanel title="Edit character">
					{characterEditorCharacter ?
						<CharacterEditorForm
							character={characterEditorCharacter}
							action={async ({ image, ...data }) => {
								const storageId = image && (await uploadImage(image))

								await updateCharacter({
									...data,
									imageId: storageId,
									characterId: characterEditorCharacter._id,
								})
								setCharacterEditorOpen(false)
							}}
						/>
					:	<EmptyState title="Character not found" icon={<LucideUserRoundX />}>
							This character has been deleted.
						</EmptyState>
					}
				</ModalPanel>
			</Modal>
		</div>
	)
}
