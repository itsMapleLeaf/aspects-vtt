import { useMutation, useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import * as React from "react"
import { api } from "../../../convex/_generated/api"
import { Rect } from "../../common/Rect.ts"
import { randomItem } from "../../common/random.ts"
import { Vector } from "../../common/vector.ts"
import { Button } from "../../ui/Button.tsx"
import { DefinitionList } from "../../ui/DefinitionList.tsx"
import { FormField } from "../../ui/Form.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "../../ui/Menu.tsx"
import { ModalButton } from "../../ui/Modal.tsx"
import { Popover, PopoverPanel, usePopoverStore } from "../../ui/Popover.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
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
import { useCreateAttributeRollMessage } from "../characters/useCreateAttributeRollMessage.tsx"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"

export function TokenMenu() {
	const { scene, viewport, tokenSelectStore, tokenDragOffset, selectedTokens } =
		useSceneContext()

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

	const store = usePopoverStore({
		placement: "bottom",
		open:
			tokenDragOffset.equals(Vector.zero) &&
			selectedTokens.length > 0 &&
			tokenSelectStore.area == null,
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
					className="flex w-min min-w-[360px] flex-col gap-3 rounded p-3"
					unmountOnHide={false}
					hideOnInteractOutside={false}
				>
					<TokenMenuButtons />
					<TokenMenuCharacterTabs />
				</PopoverPanel>
			</Popover>
		</Tabs>
	)
}

function TokenMenuButtons() {
	const {
		scene,
		tokenSelectStore,
		selectedTokens,
		selectedCharacters,
		singleSelectedCharacter,
	} = useSceneContext()
	const room = useRoom()
	const updateToken = useUpdateTokenMutation()
	const removeToken = useMutation(api.scenes.tokens.functions.remove)
	const updateCharacter = useMutation(api.characters.functions.update)

	const selectionHasCharacters = selectedCharacters.length > 0

	return (
		<div className="flex justify-center gap-[inherit]">
			{singleSelectedCharacter && (
				<CharacterModal character={singleSelectedCharacter}>
					<ModalButton
						render={
							<Button tooltip="View profile" icon={<Lucide.BookUser />} />
						}
					/>
				</CharacterModal>
			)}

			{selectionHasCharacters && (
				<RollAttributeMenu characters={selectedCharacters}>
					<Button tooltip="Roll attribute" icon={<Lucide.Dices />} />
				</RollAttributeMenu>
			)}

			{selectionHasCharacters && (
				<StressUpdateMenu characters={selectedCharacters} field="damage">
					<Button tooltip="Update damage" icon={<Lucide.HeartPulse />} />
				</StressUpdateMenu>
			)}

			{selectionHasCharacters && (
				<StressUpdateMenu characters={selectedCharacters} field="fatigue">
					<Button tooltip="Update fatigue" icon={<Lucide.Brain />} />
				</StressUpdateMenu>
			)}

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
	)
}

function TokenMenuCharacterTabs() {
	const { singleSelectedCharacter } = useSceneContext()

	if (!singleSelectedCharacter) {
		return null
	}

	return (
		<>
			<Tabs.List>
				<Tabs.Tab id="abilities">Abilities</Tabs.Tab>
				{singleSelectedCharacter.isOwner && (
					<Tabs.Tab id="status">Status</Tabs.Tab>
				)}
				<Tabs.Tab id="notes">Notes</Tabs.Tab>
			</Tabs.List>

			<ScrollArea className="h-[360px]">
				<Tabs.Panel id="abilities">
					<CharacterAbilityList character={singleSelectedCharacter} />
				</Tabs.Panel>

				{singleSelectedCharacter.isOwner && (
					<Tabs.Panel className="flex flex-col gap-2" id="status">
						<div className="flex gap-2 *:flex-1">
							<CharacterDamageField character={singleSelectedCharacter} />
							<CharacterFatigueField character={singleSelectedCharacter} />
						</div>
						<FormField label="Conditions">
							<CharacterConditionsListInput
								character={singleSelectedCharacter}
							/>
						</FormField>
					</Tabs.Panel>
				)}

				<Tabs.Panel className="flex flex-col gap-2" id="notes">
					<CharacterNotesFields character={singleSelectedCharacter} />
				</Tabs.Panel>
			</ScrollArea>
		</>
	)
}

function RollAttributeMenu(props: {
	characters: ApiCharacter[]
	children: React.ReactElement
}) {
	const createAttributeRollMessage = useCreateAttributeRollMessage()
	const notionImports = useQuery(api.notionImports.functions.get, {})
	return (
		<Menu placement="bottom">
			<MenuButton render={props.children} />
			<MenuPanel>
				{notionImports?.attributes?.map((attribute) => (
					<MenuItem
						key={attribute.key}
						icon={undefined}
						text={attribute.name}
						onClick={() => {
							for (const character of props.characters) {
								createAttributeRollMessage({
									content: `<@${character._id}>: ${attribute.name}`,
									attributeValue: character[attribute.key],
								})
							}
						}}
					/>
				))}
			</MenuPanel>
		</Menu>
	)
}

function CharacterAbilityList({ character }: { character: ApiCharacter }) {
	const raceAbilities = useCharacterRaceAbilities(character)

	const aspectSkills = Iterator.from(character.learnedAspectSkills ?? [])
		.flatMap((group) => group.aspectSkillIds)
		.map((id) => CharacterSkillTree.skillsById.get(id))
		.filter((skill) => skill != null)

	if (character.isOwner) {
		return <DefinitionList items={[...raceAbilities, ...aspectSkills]} />
	}

	return (
		<>
			<DefinitionList items={raceAbilities} />
			<p className="mt-1.5 opacity-75">Aspect skills are hidden.</p>
		</>
	)
}
