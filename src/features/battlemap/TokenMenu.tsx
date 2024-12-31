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
import { type ProtectedCharacter } from "~/convex/characters.ts"
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
import type { ApiToken } from "./types.ts"

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

	const selectedTokens =
		useQuery(api.tokens.list, scene ? { sceneId: scene._id } : "skip")?.filter(
			(token) => state.tokenIds.has(token._id),
		) ?? []

	const characters = selectedTokens.flatMap((it) =>
		it.character ? [it.character] : [],
	)
	const fullCharacters = characters.map((it) => it.full).filter(Boolean)

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

					<VisibilityOption tokens={selectedTokens} />
					<RemoveOption tokens={selectedTokens} onRemove={close} />

					<EditCharacterOption characters={characters} onClose={close} />

					{fullCharacters.length > 0 && room.isOwner && (
						<CharacterToggleCombatMemberButton
							appearance="clear"
							className="justify-start"
							characters={fullCharacters}
						/>
					)}

					<AttackCharacterOption characters={characters} onClose={close} />

					<TokenSizeFields tokens={selectedTokens} scene={scene} />

					{fullCharacters.length > 0 && (
						<CharacterConditionsInput
							characterIds={fullCharacters.map((char) => char._id)}
						/>
					)}
				</Popover.Content>
			</Popover.Root>
		</>
	)

	return { element, show }
}

function EditCharacterOption({
	characters,
	onClose,
}: {
	characters: ProtectedCharacter[]
	onClose: () => void
}) {
	const characterEditor = useCharacterEditorDialog()

	if (characters.length === 0) return null

	const singleCharacter = characters.length === 1 ? characters[0] : null

	return (
		<>
			{singleCharacter?.full && (
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
						characterEditor.show(singleCharacter._id)
						onClose()
					}}
				>
					Edit
				</Popover.Close>
			)}
			{characterEditor.element}
		</>
	)
}

function AttackCharacterOption({
	characters,
	onClose,
}: {
	characters: ProtectedCharacter[]
	onClose: () => void
}) {
	const [attackOpen, setAttackOpen] = useState(false)
	const [attackingCharacterIds, setAttackingCharacterIds] =
		useState<Set<Id<"characters">>>()

	if (characters.length === 0) return null

	return (
		<>
			<Popover.Close
				render={
					<Button
						appearance="clear"
						className="justify-start"
						icon={<LucideSwords />}
					/>
				}
				onClick={() => {
					setAttackingCharacterIds(new Set(characters.map((it) => it._id)))
					setAttackOpen(true)
					onClose()
				}}
			>
				Attack
			</Popover.Close>

			{attackingCharacterIds?.size ? (
				<CharacterAttackDialog
					characters={[...attackingCharacterIds]
						.map((id) => characters.find((c) => c._id === id))
						.filter(Boolean)}
					open={attackOpen}
					setOpen={setAttackOpen}
				/>
			) : null}
		</>
	)
}

function VisibilityOption({ tokens }: { tokens: ApiToken[] }) {
	const room = useRoomContext()
	const update = useMutation(api.tokens.update)

	if (!room.isOwner) return null

	const allVisible = tokens.every((it) => it.visible)
	const targetVisibility = !allVisible

	return (
		<ToastActionForm
			action={() =>
				update({
					updates: tokens.map((it) => ({
						tokenId: it._id,
						visible: targetVisibility,
					})),
				})
			}
		>
			<Button
				type="submit"
				appearance="clear"
				icon={allVisible ? <LucideEyeOff /> : <LucideEye />}
				className="w-full justify-start"
			>
				{allVisible ? "Hide" : "Show"}
			</Button>
		</ToastActionForm>
	)
}

function RemoveOption({
	tokens,
	onRemove,
}: {
	tokens: ApiToken[]
	onRemove: () => void
}) {
	const room = useRoomContext()
	const remove = useMutation(api.tokens.remove)

	if (!room.isOwner) return null

	return (
		<ToastActionForm
			action={async () => {
				await remove({
					tokenIds: tokens.map((it) => it._id),
				})
				onRemove()
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
	)
}

function TokenSizeFields({
	tokens,
	scene,
}: {
	tokens: ApiToken[]
	scene: { cellSize: number }
}) {
	const update = useMutation(api.tokens.update)

	return match(tokens)
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
							isMixed ? undefined : roundTo(first.size.x / scene.cellSize, 0.01)
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
		.otherwise(() => null)
}
