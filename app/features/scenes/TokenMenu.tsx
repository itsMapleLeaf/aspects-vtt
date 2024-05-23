import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import * as React from "react"
import { api } from "../../../convex/_generated/api"
import { Rect } from "../../common/Rect.ts"
import { randomItem } from "../../common/random.ts"
import { useFilter } from "../../common/react.ts"
import { Vector } from "../../common/vector.ts"
import { Button } from "../../ui/Button.tsx"
import { DefinitionList } from "../../ui/DefinitionList.tsx"
import { FormField } from "../../ui/Form.tsx"
import { ModalButton } from "../../ui/Modal.tsx"
import { Popover, PopoverPanel, usePopoverStore } from "../../ui/Popover.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { AttributeDiceRollButtonGrid } from "../characters/AttributeDiceRollButtonGrid.tsx"
import { CharacterConditionsListInput } from "../characters/CharacterConditionsListInput.tsx"
import {
	CharacterDamageField,
	CharacterFatigueField,
	CharacterNotesFields,
} from "../characters/CharacterForm.tsx"
import { CharacterModal } from "../characters/CharacterModal.tsx"
import { StressUpdateMenu } from "../characters/StressUpdateMenu.tsx"
import { CharacterSkillTree } from "../characters/skills.ts"
import type { ApiCharacter } from "../characters/types.ts"
import { useCharacterRaceAbilities } from "../characters/useCharacterRaceAbilities.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"

export function TokenMenu() {
	const { scene, viewport, tokenSelectStore, tokenDragOffset, selectedTokens } = useSceneContext()

	let anchor = Rect.from({
		topLeft: selectedTokens
			.map((it) => it.position)
			.reduce(Vector.topLeftMost, Number.POSITIVE_INFINITY),
		bottomRight: selectedTokens
			.map((it) => {
				if (it.character) return Vector.from(it.position).plus(scene.cellSize)
				if (it.area) return Vector.from(it.position).plus(it.area)
				return it.position
			})
			.reduce(Vector.bottomRightMost, Number.NEGATIVE_INFINITY),
	})

	anchor = anchor
		.withPosition(viewport.offset.plus(anchor.topLeft.times(viewport.scale)))
		.scale(viewport.scale)

	const open =
		tokenDragOffset.equals(Vector.zero) &&
		selectedTokens.length > 0 &&
		tokenSelectStore.area == null

	const store = usePopoverStore({
		placement: "bottom",
		open,
		setOpen: (open) => {
			if (!open) {
				tokenSelectStore.clear()
			}
		},
	})

	React.useLayoutEffect(() => {
		if (!open) return
		store.render()
	}, [store, open, anchor])

	return (
		<Tabs>
			<Popover store={store}>
				<PopoverPanel
					getAnchorRect={() => anchor}
					modal={false}
					fixed
					className="flex w-min min-w-[360px] flex-col gap-2 rounded p-3"
					unmountOnHide={false}
					hideOnInteractOutside={false}
				>
					<TokenMenuContent />
				</PopoverPanel>
			</Popover>
		</Tabs>
	)
}

function TokenMenuContent() {
	const { scene, tokenSelectStore, selectedTokens: selectedTokensInput } = useSceneContext()
	const room = useRoom()
	const updateToken = useUpdateTokenMutation()
	const removeToken = useMutation(api.scenes.tokens.functions.remove)
	const updateCharacter = useMutation(api.characters.functions.update)

	// filter out empty token arrays to avoid "flash of empty content" while closing
	const selectedTokens = useFilter(selectedTokensInput, (it) => it.length > 0)

	const selectedCharacters = Iterator.from(selectedTokens)
		.map((it) => it.character)
		.filter((it) => it != null)
		.toArray()

	const selectionHasCharacters = selectedCharacters.length > 0

	const singleSelectedCharacter =
		selectedCharacters.length === 1 ? selectedCharacters[0] : undefined

	return (
		<>
			<div className="flex justify-center gap-[inherit]">
				{selectedTokens.length >= 2 && (
					<Button
						tooltip="Choose random"
						icon={<Lucide.Shuffle />}
						onClick={() => {
							const token = randomItem(selectedTokens)
							if (token) {
								tokenSelectStore.clear()
								tokenSelectStore.setItemSelected(token.key, true)
							}
						}}
					/>
				)}

				{room.isOwner && scene && selectedTokens.some((it) => !it.visible) && (
					<Button
						tooltip="Show token"
						icon={<Lucide.Image />}
						onClick={() => {
							for (const token of selectedTokens) {
								updateToken({
									sceneId: scene._id,
									key: token.key,
									visible: true,
								})
							}
						}}
					/>
				)}

				{room.isOwner && scene && selectedTokens.some((it) => it.visible) && (
					<Button
						tooltip="Hide token"
						icon={<Lucide.ImageOff />}
						onClick={() => {
							for (const token of selectedTokens) {
								updateToken({
									sceneId: scene._id,
									key: token.key,
									visible: false,
								})
							}
						}}
					/>
				)}

				{room.isOwner && selectedCharacters.some((it) => !it.nameVisible) && (
					<Button
						tooltip="Show name"
						icon={<Lucide.Eye />}
						onClick={() => {
							for (const character of selectedCharacters) {
								updateCharacter({
									id: character._id,
									nameVisible: true,
								})
							}
						}}
					/>
				)}

				{room.isOwner && selectedCharacters.some((it) => it.nameVisible) && (
					<Button
						tooltip="Hide name"
						icon={<Lucide.EyeOff />}
						onClick={() => {
							for (const character of selectedCharacters) {
								updateCharacter({
									id: character._id,
									nameVisible: false,
								})
							}
						}}
					/>
				)}

				{scene && selectedTokens.length > 0 && (
					<Button
						tooltip="Remove"
						icon={<Lucide.X />}
						onClick={() => {
							for (const token of selectedTokens) {
								removeToken({ sceneId: scene._id, tokenKey: token.key })
							}
						}}
					/>
				)}
			</div>

			{selectedCharacters.length > 0 && (
				<AttributeDiceRollButtonGrid className="gap-[inherit]" characters={selectedCharacters} />
			)}

			<div className="flex gap-[inherit] *:flex-1 empty:hidden">
				{singleSelectedCharacter && (
					<CharacterModal character={singleSelectedCharacter}>
						<ModalButton render={<Button text="View profile" icon={<Lucide.BookUser />} />} />
					</CharacterModal>
				)}
				{selectionHasCharacters && (
					<StressUpdateMenu characters={selectedCharacters}>
						<Button text="Update stress" icon={<Lucide.HeartCrack />} />
					</StressUpdateMenu>
				)}
			</div>

			{singleSelectedCharacter?.isOwner && (
				<TokenMenuCharacterTabs character={singleSelectedCharacter} />
			)}
		</>
	)
}

function TokenMenuCharacterTabs({ character }: { character: ApiCharacter }) {
	return (
		<>
			<Tabs.List>
				<Tabs.Tab id="abilities">Abilities</Tabs.Tab>
				{character.isOwner && <Tabs.Tab id="status">Status</Tabs.Tab>}
				<Tabs.Tab id="notes">Notes</Tabs.Tab>
			</Tabs.List>

			<ScrollArea className="h-[360px]">
				<Tabs.Panel id="abilities">
					<CharacterAbilityList character={character} />
				</Tabs.Panel>

				{character.isOwner && (
					<Tabs.Panel className="flex flex-col gap-2" id="status">
						<div className="flex gap-2 *:flex-1">
							<CharacterDamageField character={character} />
							<CharacterFatigueField character={character} />
						</div>
						<FormField label="Conditions">
							<CharacterConditionsListInput character={character} />
						</FormField>
					</Tabs.Panel>
				)}

				<Tabs.Panel className="flex flex-col gap-2" id="notes">
					<CharacterNotesFields character={character} />
				</Tabs.Panel>
			</ScrollArea>
		</>
	)
}

function CharacterAbilityList({ character }: { character: ApiCharacter }) {
	const raceAbilities = useCharacterRaceAbilities(character)

	if (!character.isOwner) {
		return (
			<>
				<DefinitionList items={raceAbilities} />
				<p className="mt-1.5 opacity-75">Aspect skills are hidden.</p>
			</>
		)
	}

	const aspectSkills = Iterator.from(character.learnedAspectSkills ?? [])
		.flatMap((group) => group.aspectSkillIds)
		.map((id) => CharacterSkillTree.skillsById.get(id))
		.filter((skill) => skill != null)
		.toArray()

	return <DefinitionList items={[...raceAbilities, ...aspectSkills]} />
}
