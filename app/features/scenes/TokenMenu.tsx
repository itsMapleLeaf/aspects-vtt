import type { TabStore } from "@ariakit/react"
import { useMutation, useQuery } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { api } from "../../../convex/_generated/api"
import type { ApiToken } from "../../../convex/scenes/tokens/functions.ts"
import { Rect } from "../../common/Rect.ts"
import { randomItem } from "../../common/random.ts"
import { useFilter } from "../../common/react.ts"
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
import type { ApiScene } from "./types.ts"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"
import { useViewport } from "./viewport.tsx"

export const TokenMenu = observer(function TokenMenu({
	scene,
	selectedTokens,
	children,
	open,
	onClose,
}: {
	scene: ApiScene
	selectedTokens: ApiToken[]
	children: React.ReactNode
	open: boolean
	onClose: () => void
}) {
	const viewport = useViewport()

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
		open,
		setOpen: (open) => {
			if (!open) onClose()
		},
	})

	React.useLayoutEffect(() => {
		if (!open) return
		store.render()
	}, [store, open, anchor.left, anchor.top, anchor.width, anchor.height])

	return (
		<Popover store={store}>
			<PopoverPanel
				getAnchorRect={() => anchor}
				modal={false}
				fixed
				className="flex w-min min-w-[360px] flex-col gap-3 rounded p-3"
				unmountOnHide={false}
				hideOnInteractOutside={false}
			>
				{children}
			</PopoverPanel>
		</Popover>
	)
})

export function TokenMenuContent(props: {
	selectedTokens: ApiToken[]
	onTokenSelected: (token: ApiToken) => void
	tabStore: TabStore
}) {
	const room = useRoom()
	const scene = useQuery(api.scenes.functions.getCurrent, { roomId: room._id })
	const updateToken = useUpdateTokenMutation()
	const removeToken = useMutation(api.scenes.tokens.functions.remove)
	const updateCharacter = useMutation(api.characters.functions.update)

	// even if the menu is only rendered with 1+ tokens,
	// it renders a 0 token "flash of nothing state" during the close state,
	// so we use this filter to only render with contentful arrays
	const selectedTokens = useFilter(props.selectedTokens, (it) => it.length > 0)

	const selectedCharacters = Iterator.from(selectedTokens)
		.map((it) => it.character)
		.filter((it) => it != null)
		.toArray()

	const selectionHasCharacters = selectedCharacters.length > 0
	const singleSelectedCharacter =
		(!selectedCharacters[1] && selectedCharacters[0]) ?? undefined

	return (
		<>
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
								props.onTokenSelected(token)
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

			{singleSelectedCharacter && (
				<Tabs store={props.tabStore}>
					<Tabs.List>
						<Tabs.Tab>Abilities</Tabs.Tab>
						{singleSelectedCharacter.isOwner && <Tabs.Tab>Status</Tabs.Tab>}
						<Tabs.Tab>Notes</Tabs.Tab>
					</Tabs.List>

					<ScrollArea className="h-[360px]">
						<Tabs.Panel>
							<CharacterAbilityList character={singleSelectedCharacter} />
						</Tabs.Panel>

						{singleSelectedCharacter.isOwner && (
							<Tabs.Panel className="flex flex-col gap-2">
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

						<Tabs.Panel className="flex flex-col gap-2">
							<CharacterNotesFields character={singleSelectedCharacter} />
						</Tabs.Panel>
					</ScrollArea>
				</Tabs>
			)}
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
