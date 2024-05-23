import * as FloatingUI from "@floating-ui/react-dom"
import { useMutation } from "convex/react"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { createPortal } from "react-dom"
import { api } from "../../../convex/_generated/api"
import { Rect } from "../../common/Rect.ts"
import { randomItem } from "../../common/random.ts"
import { useFilter } from "../../common/react.ts"
import { Vector } from "../../common/vector.ts"
import { Button } from "../../ui/Button.tsx"
import { DefinitionList } from "../../ui/DefinitionList.tsx"
import { FormField } from "../../ui/Form.tsx"
import { ModalButton } from "../../ui/Modal.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { panel, translucentPanel } from "../../ui/styles.ts"
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
		// open: open && position != null,
		placement: "bottom",
		strategy: "fixed",
		middleware: [
			FloatingUI.offset(16),
			FloatingUI.shift({
				crossAxis: true,
				padding: 16,
			}),
		],
		elements: {
			reference: {
				getBoundingClientRect: () => anchor,
			},
		},
	})

	return (
		<Tabs>
			{/* @ts-expect-error */}
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

	// filter out empty token arrays to avoid "flash of empty content" while closing
	const selectedTokens = useFilter(selectedTokensInput, (it) => it.length > 0)

	const selectedCharacters = Iterator.from(selectedTokens)
		.map((it) => it.character)
		.filter((it) => it != null)
		.toArray()

	const selectionHasCharacters = selectedCharacters.length > 0

	const singleSelectedCharacter =
		selectedCharacters.length === 1 ? selectedCharacters[0] : undefined

	type TabView = {
		title: string
		content: JSX.Element
	}

	const tabViews: TabView[] = []

	if (selectedCharacters.length > 0) {
		tabViews.push({
			title: "Abilities",
			content: (
				<>
					<AttributeDiceRollButtonGrid className="gap-[inherit]" characters={selectedCharacters} />
					{singleSelectedCharacter && (
						<div className={panel()}>
							<ScrollArea className="max-h-[360px]">
								<div className="p-3">
									<CharacterAbilityList character={singleSelectedCharacter} />
								</div>
							</ScrollArea>
						</div>
					)}
				</>
			),
		})
	}

	if (selectionHasCharacters) {
		tabViews.push({
			title: "Status",
			content: (
				<>
					{singleSelectedCharacter && (
						<div className="flex gap-2 *:flex-1">
							<CharacterDamageField character={singleSelectedCharacter} />
							<CharacterFatigueField character={singleSelectedCharacter} />
						</div>
					)}
					{singleSelectedCharacter && (
						<FormField label="Conditions">
							<CharacterConditionsListInput character={singleSelectedCharacter} />
						</FormField>
					)}
					<div className="flex gap-[inherit] *:flex-1 empty:hidden">
						<StressUpdateMenu characters={selectedCharacters}>
							<Button text="Advanced stress update" icon={<Lucide.WandSparkles />} />
						</StressUpdateMenu>
					</div>
				</>
			),
		})
	}

	if (singleSelectedCharacter) {
		tabViews.push({
			title: "Notes",
			content: <CharacterNotesFields character={singleSelectedCharacter} />,
		})
	}

	return (
		<div className="flex-center gap-3">
			<div className={translucentPanel("flex justify-center gap-2 p-2")}>
				{singleSelectedCharacter && (
					<CharacterModal character={singleSelectedCharacter}>
						<ModalButton
							render={
								<Button text="View profile" icon={<Lucide.BookUser />} className="shrink-0" />
							}
						/>
					</CharacterModal>
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

			{tabViews.length > 0 && (
				<div className={translucentPanel("flex w-[360px] flex-col gap-2 p-2")}>
					<Tabs.List>
						{tabViews.map((view) => (
							<Tabs.Tab key={view.title} id={view.title}>
								{view.title}
							</Tabs.Tab>
						))}
					</Tabs.List>
					{tabViews.map((view) => (
						<Tabs.Panel key={view.title} id={view.title} className="flex flex-col gap-2">
							{view.content}
						</Tabs.Panel>
					))}
				</div>
			)}
		</div>
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
