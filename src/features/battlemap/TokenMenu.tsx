import { useMutation, useQuery } from "convex/react"
import {
	LucideEdit,
	LucideEye,
	LucideEyeOff,
	LucideSwords,
	LucideTrash,
} from "lucide-react"
import {
	ComponentProps,
	createContext,
	startTransition,
	use,
	useState,
} from "react"
import { match, P } from "ts-pattern"
import { Button } from "~/components/Button.tsx"
import { Popover } from "~/components/Popover.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButtonRow } from "~/features/characters/CharacterAttributeButtonRow.tsx"
import { CharacterToggleCombatMemberButton } from "~/features/characters/CharacterToggleCombatMemberButton.tsx"
import { Id } from "../../../convex/_generated/dataModel"
import { raise } from "../../../shared/errors.ts"
import { ToastActionForm } from "../../components/ToastActionForm.tsx"
import { panel } from "../../styles/panel.ts"
import { CharacterAttackDialog } from "../characters/CharacterAttackDialog.tsx"
import { CharacterConditionsInput } from "../characters/CharacterConditionsInput.tsx"
import { useCharacterEditorDialog } from "../characters/CharacterEditorDialog.tsx"
import { CharacterToggleTokenButton } from "../characters/CharacterToggleTokenButton.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { useActiveSceneContext } from "../scenes/context.ts"

function useTokenMenuController() {
	const [state, setState] = useState({
		open: false,
		position: { x: 0, y: 0 },
		tokenIds: new Set<Id<"characterTokens">>(),
	})

	const handleTrigger = (
		event: { clientX: number; clientY: number },
		tokenIds: Iterable<Id<"characterTokens">>,
	) => {
		startTransition(() => {
			setState({
				open: true,
				position: { x: event.clientX, y: event.clientY },
				tokenIds: new Set(tokenIds),
			})
		})
	}

	const close = () => {
		startTransition(() => {
			setState((s) => ({ ...s, open: false }))
		})
	}

	return { ...state, handleTrigger, close }
}

const Context = createContext<
	ReturnType<typeof useTokenMenuController> | undefined
>(undefined)

export function useTokenMenu() {
	return use(Context) ?? raise("bad")
}

export function TokenMenu({
	children,
	...props
}: ComponentProps<typeof Popover.Root>) {
	const controller = useTokenMenuController()
	const room = useRoomContext()
	const scene = useActiveSceneContext()
	const update = useMutation(api.tokens.update)
	const remove = useMutation(api.tokens.remove)

	const selectedTokens =
		useQuery(api.tokens.list, scene ? { sceneId: scene._id } : "skip")?.filter(
			(token) => controller.tokenIds.has(token._id),
		) ?? []

	const visibleTokens = selectedTokens.filter((it) => it.visible)
	const hiddenTokens = selectedTokens.filter((it) => !it.visible)

	const characters = selectedTokens.flatMap((it) =>
		it.characterId ? [it.character] : [],
	)
	const fullCharacters = characters.map((it) => it.full).filter(Boolean)
	const characterEditor = useCharacterEditorDialog()

	const [attackOpen, setAttackOpen] = useState(false)
	const [attackingCharacterIds, setAttackingCharacterIds] =
		useState<Set<NormalizedCharacter["_id"]>>()

	const attackingCharacters =
		attackingCharacterIds &&
		selectedTokens
			.map((it) => it.characterId && it.character)
			.filter(Boolean)
			.filter((it) => attackingCharacterIds.has(it._id))

	return (
		<>
			<Context value={controller}>{children}</Context>

			<Popover.Root placement="bottom-start" open={controller.open} {...props}>
				<Popover.Content
					getAnchorRect={() => controller.position ?? null}
					className={panel("grid w-[240px] rounded-xl p-2 gap-2")}
					backdrop={<Popover.Backdrop onPointerDown={controller.close} />}
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
								controller.close()
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
										{fullCharacters.length > 0 && room.isOwner && (
											<Popover.Close
												render={
													<CharacterToggleTokenButton
														appearance="clear"
														className="justify-start"
														characters={fullCharacters}
													/>
												}
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
}
