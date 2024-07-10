import * as FloatingUI from "@floating-ui/react-dom"
import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { unwrap } from "~/helpers/errors.ts"
import { CheckboxField } from "~/ui/CheckboxField.tsx"
import { Input } from "~/ui/Input.tsx"
import { ModalButton } from "~/ui/Modal.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "~/ui/Popover.tsx"
import { Select } from "~/ui/Select.tsx"
import { useNumberInput } from "~/ui/useNumberInput.tsx"
import { api } from "../../../convex/_generated/api"
import { Rect } from "../../helpers/Rect.ts"
import { Vector } from "../../helpers/Vector.ts"
import { randomItem } from "../../helpers/random.ts"
import { useFilter } from "../../helpers/react/hooks.ts"
import { Button } from "../../ui/Button.tsx"
import { FormField, FormLayout, FormRow } from "../../ui/Form.tsx"
import { Menu, MenuButton, MenuPanel } from "../../ui/Menu.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { panel, translucentPanel } from "../../ui/styles.ts"
import { AttributeDiceRollButtonGrid } from "../attributes/AttributeDiceRollButtonGrid.tsx"
import { type Attribute, listAttributeIds, listAttributes } from "../attributes/data.ts"
import { CharacterAbilityList } from "../characters/CharacterAbilityList.tsx"
import { CharacterConditionsListInput } from "../characters/CharacterConditionsListInput.tsx"
import { CharacterNotesFields } from "../characters/CharacterForm.tsx"
import { CharacterImage } from "../characters/CharacterImage.tsx"
import { CharacterModal } from "../characters/CharacterModal.tsx"
import { CharacterSearchList } from "../characters/CharacterSearchList.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { StressUpdateMenu } from "../characters/StressUpdateMenu.tsx"
import { useCharacterUpdatePermission, useOwnedCharacters } from "../characters/hooks.ts"
import type { ApiCharacter } from "../characters/types.ts"
import { useSafeAction } from "../convex/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "./SceneContext.tsx"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"

export function TokenMenu() {
	const { scene, viewport, tokenSelectStore, tokenDragOffset, selectedTokens } = useSceneContext()

	let anchor = Rect.from({
		topLeft: selectedTokens
			.map((it) => Vector.from(it.position).roundedTo(scene.cellSize))
			.reduce(Vector.topLeftMost, Number.POSITIVE_INFINITY),
		bottomRight: selectedTokens
			.map((it) => {
				if (it.character)
					return Vector.from(it.position).roundedTo(scene.cellSize).plus(scene.cellSize)
				if (it.area)
					return Vector.from(it.position)
						.roundedTo(scene.cellSize)
						.plus(Vector.from(it.area).roundedTo(scene.cellSize))
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

	// this was to position the menu relative to the cursor,
	// but that didn't work out well
	// const [position, setPosition] = useState(Vector.zero)
	// const cursorRef = useRef(Vector.zero)

	// useWindowEvent("pointermove", (event) => {
	// 	cursorRef.current = Vector.from(event.clientX, event.clientY)
	// })

	// layout effect avoids a single frame of lag when opening the menu
	// useLayoutEffect(() => {
	// 	if (open) setPosition(cursorRef.current)
	// }, [open, tokenSelectStore.selected])

	const floating = FloatingUI.useFloating({
		placement: "bottom",
		strategy: "fixed",
		middleware: [FloatingUI.offset(16)],
		elements: {
			reference: {
				getBoundingClientRect: () => anchor,
			},
		},
		whileElementsMounted: FloatingUI.autoUpdate,
	})

	return (
		<Tabs>
			{createPortal(
				<div
					ref={floating.refs.setFloating}
					style={{ ...floating.floatingStyles, display: open ? undefined : "none" }}
				>
					<TokenMenuContent />
				</div>,
				document.body,
			)}
		</Tabs>
	)
}

function TokenMenuContent() {
	const { tokenSelectStore, selectedTokens: selectedTokensInput } = useSceneContext()
	const room = useRoom()
	const updateToken = useUpdateTokenMutation()
	const removeToken = useMutation(api.scenes.tokens.functions.remove)
	const updateCharacter = useMutation(api.characters.functions.update)
	const ownedCharacters = useOwnedCharacters()

	// filter out empty token arrays to avoid "flash of empty content" while closing
	const selectedTokens = useFilter(selectedTokensInput, (it) => it.length > 0)

	const selectedCharacters = Iterator.from(selectedTokens)
		.map((it) => it.character)
		.filter((it) => it != null)
		.toArray()

	const selectionHasCharacters = selectedCharacters.length > 0

	const singleSelectedCharacter =
		selectedCharacters.length === 1 ? selectedCharacters[0] : undefined

	const hasPermissions = useCharacterUpdatePermission(singleSelectedCharacter)

	return (
		<div className="flex-center gap-3">
			<div className={translucentPanel("flex justify-center gap-2 p-2")}>
				{selectionHasCharacters && (
					<Menu placement="top">
						<MenuButton render={<Button tooltip="Status" icon={<Lucide.HeartPulse />} />} />
						<MenuPanel className={translucentPanel("max-w-[360px] p-2")} gutter={16}>
							{singleSelectedCharacter && hasPermissions && (
								<div className="flex gap-2 *:flex-1 empty:hidden">
									<CharacterStatusFields character={singleSelectedCharacter} />
								</div>
							)}
							<div className="flex gap-[inherit] *:flex-1 empty:hidden">
								<StressUpdateMenu characters={selectedCharacters}>
									<Button text="Advanced vitality update" icon={<Lucide.WandSparkles />} />
								</StressUpdateMenu>
							</div>
							{singleSelectedCharacter && (
								<FormField label="Conditions">
									<CharacterConditionsListInput character={singleSelectedCharacter} />
								</FormField>
							)}
						</MenuPanel>
					</Menu>
				)}

				{selectionHasCharacters && (
					<Menu placement="top">
						<MenuButton render={<Button tooltip="Abilities" icon={<Lucide.BarChartBig />} />} />
						<MenuPanel className={translucentPanel("max-w-[360px] p-2")} gutter={16}>
							{singleSelectedCharacter && (
								<div className={panel()}>
									<ScrollArea className="max-h-[360px]">
										<div className="p-3">
											<CharacterAbilityList character={singleSelectedCharacter} />
										</div>
									</ScrollArea>
								</div>
							)}
							<AttributeDiceRollButtonGrid
								className="gap-[inherit]"
								characters={selectedCharacters}
							/>
						</MenuPanel>
					</Menu>
				)}

				{selectionHasCharacters && (ownedCharacters.length > 0 || room.isOwner) && (
					<Menu placement="top">
						<MenuButton render={<Button tooltip="Attack" icon={<Lucide.Swords />} />} />
						<MenuPanel className={translucentPanel("max-w-[360px]")} gutter={16}>
							<CharacterAttackForm characters={selectedCharacters} />
						</MenuPanel>
					</Menu>
				)}

				{singleSelectedCharacter && (
					<CharacterModal character={singleSelectedCharacter}>
						<Button tooltip="Profile" icon={<Lucide.BookUser />} element={<ModalButton />} />
					</CharacterModal>
				)}

				{singleSelectedCharacter && hasPermissions && (
					<Menu placement="top">
						<MenuButton render={<Button tooltip="Notes" icon={<Lucide.NotebookPen />} />} />
						<MenuPanel className={translucentPanel("w-[360px] p-2")} gutter={16}>
							<CharacterNotesFields character={singleSelectedCharacter} />
						</MenuPanel>
					</Menu>
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

				{room.isOwner && room.currentScene && selectedTokens.some((it) => !it.visible) && (
					<Button
						tooltip="Show token"
						icon={<Lucide.Image />}
						onClick={() => {
							for (const token of selectedTokens) {
								updateToken({
									sceneId: unwrap(room.currentScene),
									key: token.key,
									visible: true,
								})
							}
						}}
					/>
				)}

				{room.isOwner && room.currentScene && selectedTokens.some((it) => it.visible) && (
					<Button
						tooltip="Hide token"
						icon={<Lucide.ImageOff />}
						onClick={() => {
							for (const token of selectedTokens) {
								updateToken({
									sceneId: unwrap(room.currentScene),
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

				{room.currentScene && selectedTokens.length > 0 && (
					<Button
						tooltip="Remove"
						icon={<Lucide.Trash />}
						onClick={() => {
							for (const token of selectedTokens) {
								removeToken({ sceneId: unwrap(room.currentScene), tokenKey: token.key })
							}
						}}
					/>
				)}
			</div>
		</div>
	)
}

function CharacterAttackForm({ characters }: { characters: ApiCharacter[] }) {
	const room = useRoom()
	const { tokens } = useSceneContext()

	let attackers = tokens.map((it) => it.character).filter(Boolean)
	if (!room.isOwner) {
		attackers = attackers.filter((it) => it.isOwner)
	}

	const defaultAttacker = attackers.find((it) => it.isOwner) ?? attackers[0]
	const [attacker, setAttacker] = useState(defaultAttacker)

	const [attributeId, setAttributeId] = useState<Attribute["id"]>(() => {
		if (!defaultAttacker) return "strength"
		// use their strongest attribute by default
		return greatestBy(listAttributeIds(), (it) => defaultAttacker[it] ?? 0)
	})

	const boostCountInput = useNumberInput({ defaultValue: 0 })
	const snagCountInput = useNumberInput({ defaultValue: 0 })
	const [pushYourself, setPushYourself] = useState(false)
	const valid = boostCountInput.valid && snagCountInput.valid

	const attack = useMutation(api.characters.functions.attack)
	const updateCharacter = useMutation(api.characters.functions.update)

	const [, action] = useSafeAction(async (_data: FormData) => {
		if (!valid) return
		if (!attacker) return

		if (pushYourself && attacker.resolve != null) {
			await updateCharacter({
				id: attacker._id,
				resolve: attacker.resolve - 2,
			})
		}

		await attack({
			attackerId: attacker._id,
			defenderIds: characters.map((it) => it._id),
			attackerAttribute: attributeId,
			boostCount: boostCountInput.value + (pushYourself ? 1 : 0),
			snagCount: snagCountInput.value,
		})
	})

	const [open, setOpen] = useState(false)

	const attackerIcon =
		attacker ?
			<CharacterImage
				character={attacker}
				className={{ image: "rounded-full object-cover object-top" }}
			/>
		:	<Lucide.UserPlus2 />

	return (
		<form action={action}>
			<FormLayout>
				<FormField label="Attacker" className="items-stretch">
					<Popover placement="bottom-start" open={open} setOpen={setOpen}>
						<PopoverTrigger render={<Button align="start" icon={attackerIcon} />}>
							{attacker ? attacker.name : "Select attacker"}
						</PopoverTrigger>
						<PopoverPanel className="flex w-64 flex-col gap-2 p-2">
							<CharacterSearchList
								characters={attackers}
								onSelect={(character) => {
									setAttacker(character)
									setOpen(false)
								}}
							/>
						</PopoverPanel>
					</Popover>
				</FormField>

				<Select
					label="Attribute"
					options={listAttributes().map((it) => ({
						label: it.name,
						value: it.id,
					}))}
					value={attributeId}
					onChange={setAttributeId}
				/>

				<FormRow>
					<FormField label="Boost dice" className="flex-1">
						<Input {...boostCountInput.props} />
					</FormField>
					<FormField label="Snag dice" className="flex-1">
						<Input {...snagCountInput.props} />
					</FormField>
				</FormRow>

				<CheckboxField
					label="Push yourself"
					checked={pushYourself}
					onChange={(event) => setPushYourself(event.target.checked)}
				/>

				<Button type="submit" icon={<Lucide.Swords />}>
					Attack
					{characters.length > 1 && (
						<>
							{" "}
							<strong>{characters.length}</strong> characters
						</>
					)}
				</Button>
			</FormLayout>
		</form>
	)
}

function greatestBy<T>(items: Iterable<T>, rank: (item: T) => number) {
	return Iterator.from(items).reduce((a, b) => (rank(a) > rank(b) ? a : b))
}
