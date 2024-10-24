import { useMutation, useQuery } from "convex/react"
import { LucideEdit, LucideEye, LucideEyeOff, LucideSwords } from "lucide-react"
import { ComponentProps, createContext, use, useState } from "react"
import { match, P } from "ts-pattern"
import { Button } from "~/components/Button.tsx"
import { Popover } from "~/components/Popover.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButtonRow } from "~/features/characters/CharacterAttributeButtonRow.tsx"
import { CharacterToggleCombatMemberButton } from "~/features/characters/CharacterToggleCombatMemberButton.tsx"
import { CharacterVitalFields } from "~/features/characters/CharacterVitalFields.tsx"
import { List } from "~/shared/list.ts"
import { Id } from "../../../convex/_generated/dataModel"
import { raise } from "../../../shared/errors.ts"
import { Checkbox } from "../../components/Checkbox.tsx"
import { ToastActionForm } from "../../components/ToastActionForm.tsx"
import { panel } from "../../styles/panel.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { useActiveSceneContext } from "../scenes/context.ts"
import { CharacterAttackDialog } from "./CharacterAttackDialog.tsx"
import { CharacterConditionsInput } from "./CharacterConditionsInput.tsx"
import { useCharacterEditorDialog } from "./CharacterEditorDialog.tsx"
import { CharacterToggleTokenButton } from "./CharacterToggleTokenButton.tsx"

function useCharacterMenuController() {
	const [state, setState] = useState({
		open: false,
		position: { x: 0, y: 0 },
		characterIds: new Set<Id<"characters">>(),
	})

	const handleTrigger = (
		event: { clientX: number; clientY: number },
		characterIds: Iterable<Id<"characters">>,
	) => {
		setState({
			open: true,
			position: { x: event.clientX, y: event.clientY },
			characterIds: new Set(characterIds),
		})
	}

	const close = () => {
		setState((s) => ({ ...s, open: false }))
	}

	return { ...state, handleTrigger, close }
}

const Context = createContext<
	ReturnType<typeof useCharacterMenuController> | undefined
>(undefined)

export function useCharacterMenu() {
	return use(Context) ?? raise("bad")
}

export function CharacterMenuTrigger({
	characterIds,
	...props
}: ComponentProps<"div"> & {
	characterIds: Iterable<Id<"characters">>
}) {
	const context = useCharacterMenu()
	return (
		<div
			{...props}
			onContextMenu={(event) => {
				props.onContextMenu?.(event)
				if (event.defaultPrevented) return
				event.preventDefault()
				context.handleTrigger(event, characterIds)
			}}
		/>
	)
}

export function CharacterMenu({
	children,
	...props
}: ComponentProps<typeof Popover.Root>) {
	const context = useCharacterMenuController()
	const room = useRoomContext()
	const scene = useActiveSceneContext()
	const update = useMutation(api.tokens.update)

	const tokens =
		useQuery(api.tokens.list, scene ? { sceneId: scene._id } : "skip") ?? []

	const tokensByCharacterId = new Map(tokens.map((it) => [it.characterId, it]))

	const characterTokens = List.from(context.characterIds)
		.map((id) => tokensByCharacterId.get(id))
		.compact()

	const editor = useCharacterEditorDialog()

	const [attackOpen, setAttackOpen] = useState(false)
	const [attackingCharacterIds, setAttackingCharacterIds] =
		useState<Set<NormalizedCharacter["_id"]>>()

	const attackingCharacters =
		attackingCharacterIds &&
		characterTokens
			.filter((it) => attackingCharacterIds?.has(it.characterId))
			.map((it) => it.character)

	const updateToken = useMutation(api.tokens.update)

	const items = match(characterTokens.array())
		.with(
			[{ character: { full: P.nonNullable } }],
			([{ character, ...token }]) => [
				room.isOwner && (
					<Checkbox
						key="tokenVisible"
						label="Token visible"
						checked={token.visible}
						onChange={async (visible) => {
							await updateToken({
								updates: [{ tokenId: token._id, visible }],
							})
						}}
					/>
				),
				<CharacterAttributeButtonRow
					key="attributes"
					characters={[character.full]}
				/>,
				<CharacterVitalFields key="vitals" character={character.full} />,
				<CharacterConditionsInput
					key="conditions"
					characterIds={[character.full._id]}
				/>,
				<Popover.Close
					key="attack"
					render={<Button icon={<LucideSwords />} />}
					onClick={() => {
						setAttackingCharacterIds(new Set([character._id]))
						setAttackOpen(true)
					}}
				>
					Attack
				</Popover.Close>,
				<Button key="edit" asChild icon={<LucideEdit />}>
					<Popover.Close
						onClick={() => {
							editor.show(character._id)
						}}
					>
						Edit
					</Popover.Close>
				</Button>,
				room.isOwner && (
					<Popover.Close
						key="combat"
						render={
							<CharacterToggleCombatMemberButton
								characters={[character.full]}
							/>
						}
					/>
				),
				room.isOwner && (
					<Popover.Close
						key="token"
						render={
							<CharacterToggleTokenButton characters={[character.full]} />
						}
					/>
				),
			],
		)
		.otherwise((tokens) => {
			const characters = tokens.map((it) => it.character)
			const fullCharacters = characters.map((it) => it.full).filter(Boolean)
			const visibleTokens = tokens.filter((it) => it.visible)
			const hiddenTokens = tokens.filter((it) => !it.visible)

			return [
				fullCharacters.length > 0 && (
					<CharacterAttributeButtonRow
						key="attributes"
						characters={fullCharacters}
					/>
				),

				room.isOwner && (
					<div className="flex w-full gap *:flex-1" key="tokenVisible">
						{hiddenTokens.length > 0 && (
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
								<Button type="submit" icon={<LucideEye />} className="w-full">
									Show
								</Button>
							</ToastActionForm>
						)}
						{visibleTokens.length > 0 && (
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
									icon={<LucideEyeOff />}
									className="w-full"
								>
									Hide
								</Button>
							</ToastActionForm>
						)}
					</div>
				),

				<Popover.Close
					key="attack"
					render={<Button icon={<LucideSwords />} />}
					onClick={() => {
						setAttackingCharacterIds(new Set(characters.map((it) => it._id)))
						setAttackOpen(true)
					}}
				>
					Attack
				</Popover.Close>,
				fullCharacters.length > 0 && room.isOwner && (
					<CharacterToggleCombatMemberButton
						key="combat"
						characters={fullCharacters}
					/>
				),
				fullCharacters.length > 0 && room.isOwner && (
					<Popover.Close
						key="token"
						render={<CharacterToggleTokenButton characters={fullCharacters} />}
					/>
				),
				<CharacterConditionsInput
					key="conditions"
					characterIds={fullCharacters.map((char) => char._id)}
				/>,
			]
		})
		.filter(Boolean)

	if (items.length === 0) {
		return null
	}

	return (
		<>
			<Context value={context}>{children}</Context>

			<Popover.Root placement="bottom-start" open={context.open} {...props}>
				<Popover.Content
					getAnchorRect={() => context.position ?? null}
					className={panel("grid w-[240px] rounded-xl p-2 gap-2")}
					onClose={context.close}
				>
					{items}
				</Popover.Content>
			</Popover.Root>

			{editor.element}

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
