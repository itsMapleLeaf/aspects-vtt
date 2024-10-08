import * as FloatingUI from "@floating-ui/react-dom"
import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { createPortal } from "react-dom"
import { Rect } from "../../../common/Rect.ts"
import { Vector } from "../../../common/Vector.ts"
import { unwrap } from "../../../common/errors.ts"
import { randomItem } from "../../../common/random.ts"
import { useFilter } from "../../../common/react/hooks.ts"
import { api } from "../../../convex/_generated/api"
import { Button } from "../../ui/Button.tsx"
import { FormField } from "../../ui/Form.tsx"
import { Menu, MenuButton, MenuPanel } from "../../ui/Menu.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { panel, translucentPanel } from "../../ui/styles.ts"
import { AttributeDiceRollButtonGrid } from "../attributes/AttributeDiceRollButtonGrid.tsx"
import { AddCharacterConditionInput } from "../characters/AddCharacterConditionInput.tsx"
import { CharacterAbilityList } from "../characters/CharacterAbilityList.tsx"
import { CharacterAttackForm } from "../characters/CharacterAttackForm.tsx"
import { CharacterConditionList } from "../characters/CharacterConditionList.tsx"
import { CharacterNotesFields } from "../characters/CharacterForm.tsx"
import { CharacterModal } from "../characters/CharacterModal.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { CharacterUpdateStatusForm } from "../characters/CharacterUpdateStatusForm.tsx"
import {
	useCharacterUpdatePermission,
	useOwnedCharacters,
} from "../characters/hooks.ts"
import type { ApiCharacter } from "../characters/types.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { useSceneContext } from "../scenes/SceneContext.tsx"
import { useSelectedScene } from "../scenes/hooks.ts"
import { useUpdateTokenMutation } from "./useUpdateTokenMutation.tsx"

export function TokenMenu() {
	const {
		scene,
		viewport,
		tokenSelectStore,
		tokenDragOffset,
		selectedTokens,
		placementSubdivisions,
	} = useSceneContext()

	const positionMultiple = scene.cellSize / placementSubdivisions

	let anchor = Rect.from({
		topLeft: selectedTokens
			.map((it) => Vector.from(it.position).roundedTo(positionMultiple))
			.reduce(Vector.topLeftMost, Number.POSITIVE_INFINITY),
		bottomRight: selectedTokens
			.map((it) => {
				if (it.character)
					return Vector.from(it.position)
						.roundedTo(positionMultiple)
						.plus(scene.cellSize)
				if (it.area)
					return Vector.from(it.position)
						.roundedTo(positionMultiple)
						.plus(Vector.from(it.area).roundedTo(positionMultiple))
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
					style={{
						...floating.floatingStyles,
						display: open ? undefined : "none",
					}}
				>
					<TokenMenuContent />
				</div>,
				document.body,
			)}
		</Tabs>
	)
}

function TokenMenuContent() {
	const { tokenSelectStore, selectedTokens: selectedTokensInput } =
		useSceneContext()
	const room = useRoom()
	const currentScene = useSelectedScene()
	const updateToken = useUpdateTokenMutation()
	const removeToken = useMutation(api.scenes.tokens.functions.remove)
	const updateCharacter = useMutation(api.characters.functions.update)
	const ownedCharacters = useOwnedCharacters()

	// filter out empty token arrays to avoid "flash of empty content" while closing
	const selectedTokens = useFilter(selectedTokensInput, (it) => it.length > 0)

	const selectedCharacters = Iterator.from(selectedTokens)
		.map((it) => it.character)
		.filter((it): it is ApiCharacter => it != null)
		.toArray()

	const selectionHasCharacters = selectedCharacters.length > 0

	const singleSelectedCharacter =
		selectedCharacters.length === 1 ? selectedCharacters[0] : undefined

	const hasPermissions = useCharacterUpdatePermission(singleSelectedCharacter)

	return (
		<div className={translucentPanel("flex flex-col items-center p-2 gap-2")}>
			{singleSelectedCharacter && hasPermissions && (
				<div className="flex w-64 gap-2 *:flex-1 empty:hidden">
					<CharacterStatusFields
						character={singleSelectedCharacter}
						labels={false}
						// ensure the fields show the correct value for the given character
						key={singleSelectedCharacter._id}
					/>
				</div>
			)}
			<div className="flex-center gap-3">
				<div className={"flex justify-center gap-2"}>
					{selectionHasCharacters && (
						<Menu placement="top">
							<MenuButton
								render={
									<Button
										appearance="clear"
										tooltip="Status"
										icon={<Lucide.HeartPulse />}
									/>
								}
							/>
							<MenuPanel
								className={translucentPanel("max-w-[360px] p-2")}
								gutter={16}
							>
								<FormField label="Conditions">
									<div className="flex flex-col gap-1">
										<CharacterConditionList characters={selectedCharacters} />
										<AddCharacterConditionInput
											characterIds={selectedCharacters.map((it) => it._id)}
											currentConditions={
												singleSelectedCharacter?.conditions ?? []
											}
										/>
									</div>
								</FormField>
								<FormField label="Update status">
									<CharacterUpdateStatusForm
										characterIds={selectedCharacters.map((it) => it._id)}
									/>
								</FormField>
							</MenuPanel>
						</Menu>
					)}

					{selectionHasCharacters && (
						<Menu placement="top">
							<MenuButton
								render={
									<Button
										appearance="clear"
										tooltip="Skills"
										icon={<Lucide.Target />}
									/>
								}
							/>
							<MenuPanel
								className={translucentPanel("max-w-[360px] p-2")}
								gutter={16}
							>
								{singleSelectedCharacter && (
									<div className={panel()}>
										<ScrollArea className="max-h-[360px]">
											<div className="p-3">
												<CharacterAbilityList
													character={singleSelectedCharacter}
												/>
											</div>
										</ScrollArea>
									</div>
								)}
							</MenuPanel>
						</Menu>
					)}

					{selectionHasCharacters &&
						(ownedCharacters.length > 0 || room.isOwner) && (
							<Menu placement="top">
								<MenuButton
									render={
										<Button
											appearance="clear"
											tooltip="Attack"
											icon={<Lucide.Swords />}
										/>
									}
								/>
								<MenuPanel
									className={translucentPanel("max-w-[360px]")}
									gutter={16}
								>
									<CharacterAttackForm characters={selectedCharacters} />
								</MenuPanel>
							</Menu>
						)}

					{singleSelectedCharacter && (
						<CharacterModal character={singleSelectedCharacter}>
							<Button
								appearance="clear"
								tooltip="Profile"
								icon={<Lucide.BookUser />}
								element={<CharacterModal.Button />}
							/>
						</CharacterModal>
					)}

					{singleSelectedCharacter && hasPermissions && (
						<Menu placement="top">
							<MenuButton
								render={
									<Button
										appearance="clear"
										tooltip="Notes"
										icon={<Lucide.NotebookPen />}
									/>
								}
							/>
							<MenuPanel
								className={translucentPanel("w-[360px] p-2")}
								gutter={16}
							>
								<CharacterNotesFields character={singleSelectedCharacter} />
							</MenuPanel>
						</Menu>
					)}

					{selectedTokens.length >= 2 && (
						<Button
							appearance="clear"
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

					{room.isOwner &&
						currentScene &&
						selectedTokens.some((it) => !it.visible) && (
							<Button
								appearance="clear"
								tooltip="Show token"
								icon={<Lucide.Image />}
								onClick={() => {
									for (const token of selectedTokens) {
										updateToken({
											sceneId: currentScene._id,
											key: token.key,
											visible: true,
										})
									}
								}}
							/>
						)}

					{room.isOwner &&
						currentScene &&
						selectedTokens.some((it) => it.visible) && (
							<Button
								appearance="clear"
								tooltip="Hide token"
								icon={<Lucide.ImageOff />}
								onClick={() => {
									for (const token of selectedTokens) {
										updateToken({
											sceneId: currentScene._id,
											key: token.key,
											visible: false,
										})
									}
								}}
							/>
						)}

					{room.isOwner && selectedCharacters.some((it) => !it.nameVisible) && (
						<Button
							appearance="clear"
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
							appearance="clear"
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

					{currentScene && selectedTokens.length > 0 && (
						<Button
							appearance="clear"
							tooltip="Remove"
							icon={<Lucide.Trash />}
							onClick={() => {
								for (const token of selectedTokens) {
									removeToken({
										sceneId: currentScene._id,
										tokenKey: token.key,
									})
								}
							}}
						/>
					)}
				</div>
			</div>
			{selectedCharacters.some((it) => it.permission === "full") && (
				<>
					<hr className="w-full border-primary-600" />
					<AttributeDiceRollButtonGrid
						className="gap-[inherit]"
						characters={selectedCharacters}
					/>
				</>
			)}
		</div>
	)
}
