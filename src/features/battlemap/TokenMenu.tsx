import { useMutation, useQuery } from "convex/react"
import {
	LucideEdit,
	LucideEye,
	LucideEyeOff,
	LucideSwords,
	LucideTrash,
} from "lucide-react"
import { startTransition, useState } from "react"
import { P, match } from "ts-pattern"
import { Button } from "~/components/Button.tsx"
import { Field } from "~/components/Field.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Popover } from "~/components/Popover.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButtonRow } from "~/features/characters/CharacterAttributeButtonRow.tsx"
import { CharacterToggleCombatMemberButton } from "~/features/characters/CharacterToggleCombatMemberButton.tsx"
import { roundTo } from "~/lib/math.ts"
import { Vec, VecInput } from "~/lib/vec.ts"
import { textInput } from "~/styles/input.ts"
import { Id } from "../../../convex/_generated/dataModel"
import { ToastActionForm } from "../../components/ToastActionForm.tsx"
import { panel } from "../../styles/panel.ts"
import { CharacterAttackDialog } from "../characters/CharacterAttackDialog.tsx"
import { CharacterConditionsInput } from "../characters/CharacterConditionsInput.tsx"
import { useCharacterEditorDialog } from "../characters/CharacterEditorDialog.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { useActiveSceneContext } from "../scenes/context.ts"

export function useTokenMenu() {
	const [state, setState] = useState({
		open: false,
		position: Vec.zero,
		tokenIds: new Set<Id<"characterTokens">>(),
	})

	const show = (
		position: VecInput,
		tokenIds: Iterable<Id<"characterTokens">>,
	) => {
		startTransition(() => {
			setState({
				open: true,
				position: Vec.from(position),
				tokenIds: new Set(tokenIds),
			})
		})
	}

	const close = () => {
		startTransition(() => {
			setState((s) => ({ ...s, open: false }))
		})
	}

	const room = useRoomContext()
	const scene = useActiveSceneContext()
	const update = useMutation(api.tokens.update)
	const remove = useMutation(api.tokens.remove)

	const selectedTokens =
		useQuery(api.tokens.list, scene ? { sceneId: scene._id } : "skip")?.filter(
			(token) => state.tokenIds.has(token._id),
		) ?? []

	const visibleTokens = selectedTokens.filter((it) => it.visible)
	const hiddenTokens = selectedTokens.filter((it) => !it.visible)

	const characters = selectedTokens.flatMap((it) =>
		it.character ? [it.character] : [],
	)
	const fullCharacters = characters.map((it) => it.full).filter(Boolean)
	const characterEditor = useCharacterEditorDialog()

	const [attackOpen, setAttackOpen] = useState(false)
	const [attackingCharacterIds, setAttackingCharacterIds] =
		useState<Set<NormalizedCharacter["_id"]>>()

	const attackingCharacters =
		attackingCharacterIds &&
		selectedTokens
			.map((it) => it.character)
			.filter(Boolean)
			.filter((it) => attackingCharacterIds.has(it._id))

	const element = scene && (
		<>
			<Popover.Root placement="bottom-start" open={state.open}>
				<Popover.Content
					getAnchorRect={() => state.position ?? null}
					className={panel("grid w-[240px] gap-2 rounded-xl p-2")}
					backdrop={<Popover.Backdrop onPointerDown={close} />}
				>
					{fullCharacters.length > 0 && (
						<CharacterAttributeButtonRow characters={fullCharacters} />
					)}

					{room.isOwner && hiddenTokens.length > 0 && (
						<ToastActionForm
							action={() =>
								update({
									updates: hiddenTokens.map((it) => ({
										tokenId: it._id,
										visible: true,
									})),
								})
							}
						>
							<Button
								type="submit"
								appearance="clear"
								icon={<LucideEye />}
								className="w-full justify-start"
							>
								Show
							</Button>
						</ToastActionForm>
					)}

					{room.isOwner && visibleTokens.length > 0 && (
						<ToastActionForm
							action={() =>
								update({
									updates: visibleTokens.map((it) => ({
										tokenId: it._id,
										visible: false,
									})),
								})
							}
						>
							<Button
								type="submit"
								appearance="clear"
								icon={<LucideEyeOff />}
								className="w-full justify-start"
							>
								Hide
							</Button>
						</ToastActionForm>
					)}

					{room.isOwner && (
						<ToastActionForm
							action={async () => {
								await remove({
									tokenIds: selectedTokens.map((it) => it._id),
								})
								close()
							}}
						>
							<Button
								type="submit"
								appearance="clear"
								icon={<LucideTrash />}
								className="w-full justify-start"
							>
								Remove
							</Button>
						</ToastActionForm>
					)}

					{match(characters)
						.with([{ full: P.nonNullable }], ([character]) => (
							<>
								<Popover.Close
									key="edit"
									render={
										<Button
											appearance="clear"
											icon={<LucideEdit />}
											className="justify-start"
										/>
									}
									onClick={() => {
										characterEditor.show(character._id)
									}}
								>
									Edit
								</Popover.Close>

								{/* TODO: move this to the character editor */}
								<Popover.Close
									key="attack"
									render={
										<Button
											appearance="clear"
											icon={<LucideSwords />}
											className="justify-start"
										/>
									}
									onClick={() => {
										setAttackingCharacterIds(new Set([character._id]))
										setAttackOpen(true)
									}}
								>
									Attack
								</Popover.Close>
							</>
						))
						.when(
							(characters) => characters.length > 0,
							(characters) => {
								return (
									<>
										{fullCharacters.length > 0 && room.isOwner && (
											<CharacterToggleCombatMemberButton
												appearance="clear"
												className="justify-start"
												characters={fullCharacters}
											/>
										)}
										<Popover.Close
											render={
												<Button
													appearance="clear"
													className="justify-start"
													icon={<LucideSwords />}
												/>
											}
											onClick={() => {
												setAttackingCharacterIds(
													new Set(characters.map((it) => it._id)),
												)
												setAttackOpen(true)
											}}
										>
											Attack
										</Popover.Close>
									</>
								)
							},
						)
						.otherwise(() => null)}

					{match(selectedTokens)
						.with([P._, ...P.array(P._)], (tokens) => {
							const [first, ...rest] = tokens

							const isMixed = rest.some(
								(it) =>
									roundTo(first.size.x / scene.cellSize, 0.01) !==
									roundTo(it.size.x / scene.cellSize, 0.01),
							)
							return (
								<Field label="Size (cells)" htmlFor="tokenSize">
									<NumberInput
										id="tokenSize"
										placeholder={isMixed ? "mixed" : "0"}
										value={
											isMixed
												? undefined
												: roundTo(first.size.x / scene.cellSize, 0.01)
										}
										min={0.25}
										step={0.25}
										onSubmitValue={(value) => {
											return update({
												updates: tokens.map((token) => ({
													tokenId: token._id,
													size: {
														x: value * scene.cellSize,
														y: value * scene.cellSize,
													},
												})),
											})
										}}
										className={textInput()}
									/>
								</Field>
							)
						})
						.with([P._], ([token]) => (
							<Field label="Size (cells)" htmlFor="tokenSize">
								<NumberInput
									id="tokenSize"
									value={roundTo(token.size.x / scene.cellSize, 0.01)}
									min={0.25}
									step={0.25}
									onSubmitValue={(value) => {
										return update({
											updates: [
												{
													tokenId: token._id,
													size: {
														x: value * scene.cellSize,
														y: value * scene.cellSize,
													},
												},
											],
										})
									}}
									className={textInput()}
								/>
							</Field>
						))
						.otherwise(() => null)}

					{fullCharacters.length > 0 && (
						<CharacterConditionsInput
							characterIds={fullCharacters.map((char) => char._id)}
						/>
					)}
				</Popover.Content>
			</Popover.Root>

			{characterEditor.element}

			{attackingCharacters?.length ? (
				<CharacterAttackDialog
					characters={attackingCharacters}
					open={attackOpen}
					setOpen={setAttackOpen}
				/>
			) : null}
		</>
	)

	return { element, show }
}
