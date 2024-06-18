import * as FloatingUI from "@floating-ui/react-dom"
import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { createPortal } from "react-dom"
import { api } from "../../../convex/_generated/api"
import { Rect } from "../../helpers/Rect.ts"
import { Vector } from "../../helpers/Vector.ts"
import { randomItem } from "../../helpers/random.ts"
import { useFilter } from "../../helpers/react/hooks.ts"
import { Button } from "../../ui/Button.tsx"
import { DefinitionList } from "../../ui/DefinitionList.tsx"
import { FormField } from "../../ui/Form.tsx"
import { Menu, MenuButton, MenuPanel } from "../../ui/Menu.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { panel, translucentPanel } from "../../ui/styles.ts"
import { AttributeDiceRollButtonGrid } from "../attributes/AttributeDiceRollButtonGrid.tsx"
import { CharacterConditionsListInput } from "../characters/CharacterConditionsListInput.tsx"
import { CharacterNotesFields } from "../characters/CharacterForm.tsx"
import { useCharacterModalContext } from "../characters/CharacterModal.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { StressUpdateMenu } from "../characters/StressUpdateMenu.tsx"
import { listCharacterAspectSkills, listCharacterRaceAbilities } from "../characters/helpers.ts"
import { OwnedCharacter, type ApiCharacter } from "../characters/types.ts"
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
	const { scene, tokenSelectStore, selectedTokens: selectedTokensInput } = useSceneContext()
	const room = useRoom()
	const updateToken = useUpdateTokenMutation()
	const removeToken = useMutation(api.scenes.tokens.functions.remove)
	const updateCharacter = useMutation(api.characters.functions.update)
	const characterModal = useCharacterModalContext()

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
		<div className="flex-center gap-3">
			<div className={translucentPanel("flex justify-center gap-2 p-2")}>
				{selectionHasCharacters && (
					<Menu placement="top">
						<MenuButton render={<Button text="Status" icon={<Lucide.HeartPulse />} />} />
						<MenuPanel className={translucentPanel("max-w-[360px] p-2")} gutter={16}>
							{singleSelectedCharacter && OwnedCharacter.is(singleSelectedCharacter) && (
								<div className="flex gap-2 *:flex-1 empty:hidden">
									<CharacterStatusFields character={singleSelectedCharacter} />
								</div>
							)}
							<div className="flex gap-[inherit] *:flex-1 empty:hidden">
								<StressUpdateMenu characters={selectedCharacters}>
									<Button text="Advanced stress update" icon={<Lucide.WandSparkles />} />
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
						<MenuButton render={<Button text="Abilities" icon={<Lucide.BarChartBig />} />} />
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

				{singleSelectedCharacter && (
					<Menu placement="top">
						<MenuButton render={<Button text="Notes" icon={<Lucide.NotebookPen />} />} />
						<MenuPanel className={translucentPanel("w-[360px] p-2")} gutter={16}>
							<CharacterNotesFields character={singleSelectedCharacter} />
						</MenuPanel>
					</Menu>
				)}

				{singleSelectedCharacter && (
					<Button
						text="Profile"
						icon={<Lucide.BookUser />}
						onClick={() => characterModal.show(singleSelectedCharacter._id)}
					/>
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
						icon={<Lucide.Trash />}
						onClick={() => {
							for (const token of selectedTokens) {
								removeToken({ sceneId: scene._id, tokenKey: token.key })
							}
						}}
					/>
				)}
			</div>
		</div>
	)
}

function CharacterAbilityList({ character }: { character: ApiCharacter }) {
	const raceAbilities = listCharacterRaceAbilities(character)
	const aspectSkills = character.isOwner ? listCharacterAspectSkills(character) : []
	return (
		<>
			<DefinitionList items={[...raceAbilities, ...aspectSkills]} />
			{character.isOwner ? null : <p className="mt-1.5 opacity-75">Aspect skills are hidden.</p>}
		</>
	)
}
