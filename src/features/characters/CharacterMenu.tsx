import { useMutation, useQuery } from "convex/react"
import { LucideEdit, LucideSwords, LucideVenetianMask } from "lucide-react"
import { ComponentProps, useState } from "react"
import { match, P } from "ts-pattern"
import { Button } from "~/components/Button.tsx"
import { Popover } from "~/components/Popover.tsx"
import { api } from "~/convex/_generated/api.js"
import { NormalizedCharacter, ProtectedCharacter } from "~/convex/characters.ts"
import { CharacterAttributeButtonRow } from "~/features/characters/CharacterAttributeButtonRow.tsx"
import { CharacterEditorDialog } from "~/features/characters/CharacterEditorDialog.tsx"
import { CharacterToggleCombatMemberButton } from "~/features/characters/CharacterToggleCombatMemberButton.tsx"
import { CharacterVitalFields } from "~/features/characters/CharacterVitalFields.tsx"
import { ApiCharacter } from "~/features/characters/types.ts"
import { List } from "~/shared/list.ts"
import { Checkbox } from "../../components/Checkbox.tsx"
import { Dialog } from "../../components/Dialog.tsx"
import { Field } from "../../components/Field.tsx"
import { Select } from "../../components/Select.tsx"
import { useToastAction } from "../../components/ToastActionForm.tsx"
import { lightPanel, panel } from "../../styles/panel.ts"
import { getImageUrl } from "../images/getImageUrl.ts"
import { useRoomContext } from "../rooms/context.tsx"
import { useActiveSceneContext } from "../scenes/context.ts"
import { CharacterToggleTokenButton } from "./CharacterToggleTokenButton.tsx"

export type CharacterMenuController = ReturnType<
	typeof useCharacterMenuController
>

export function useCharacterMenuController() {
	const [open, setOpen] = useState(false)
	const [characterIds, setCharacterIds] = useState(
		List.of<ApiCharacter["_id"]>(),
	)
	const [position, setPosition] = useState<{ x: number; y: number }>()

	const scene = useActiveSceneContext()
	const tokens =
		useQuery(api.tokens.list, scene ? { sceneId: scene._id } : "skip") ?? []

	const tokensByCharacterId = new Map(tokens.map((it) => [it.characterId, it]))

	return {
		position,
		open,
		characterTokens: characterIds
			.map((id) => tokensByCharacterId.get(id))
			.compact(),
		show(
			event: { x: number; y: number },
			characterIds: Iterable<ApiCharacter["_id"]>,
		) {
			setCharacterIds(List.from(characterIds))
			setPosition({ x: event.x, y: event.y })
			setOpen(true)
		},
		hide() {
			setOpen(false)
		},
	}
}

export function CharacterMenu({
	controller,
	...props
}: ComponentProps<typeof Popover.Root> & {
	controller: CharacterMenuController
}) {
	const room = useRoomContext()

	const items = match([...controller.characterTokens])
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
				<CharacterVitalFields
					key="vitals"
					className="w-[220px] gap"
					character={character.full}
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
							setEditingCharacterId(character._id)
							setEditorOpen(true)
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

			return [
				fullCharacters.length > 0 && (
					<CharacterAttributeButtonRow
						key="attributes"
						characters={fullCharacters}
					/>
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
			]
		})
		.filter(Boolean)

	const [editorOpen, setEditorOpen] = useState(false)
	const [editingCharacterId, setEditingCharacterId] =
		useState<NormalizedCharacter["_id"]>()

	const editingCharacter = controller.characterTokens
		.map((it) => it.character.full)
		.find((it) => it?._id === editingCharacterId)

	const [attackOpen, setAttackOpen] = useState(false)
	const [attackingCharacterIds, setAttackingCharacterIds] =
		useState<Set<NormalizedCharacter["_id"]>>()

	const attackingCharacters =
		attackingCharacterIds &&
		controller.characterTokens
			.filter((it) => attackingCharacterIds?.has(it.characterId))
			.map((it) => it.character)

	const updateToken = useMutation(api.tokens.update)

	if (items.length === 0) {
		return null
	}

	return (
		<Popover.Root placement="bottom-start" open={controller.open} {...props}>
			<Popover.Content
				getAnchorRect={() => controller.position ?? null}
				className={panel("grid rounded-xl p-2 gap-2")}
				onClose={controller.hide}
			>
				{items}
			</Popover.Content>
			{editingCharacter && (
				<CharacterEditorDialog
					character={editingCharacter}
					open={editorOpen}
					setOpen={setEditorOpen}
				/>
			)}
			{attackingCharacters?.length ? (
				<CharacterAttackDialog
					characters={attackingCharacters}
					open={attackOpen}
					setOpen={setAttackOpen}
				/>
			) : null}
		</Popover.Root>
	)
}

function CharacterAttackDialog({
	characters,
	...props
}: {
	characters: ProtectedCharacter[]
} & ComponentProps<typeof Dialog.Root>) {
	const room = useRoomContext()
	const user = useQuery(api.users.me)
	const allCharacters = useQuery(api.characters.list, { roomId: room._id })

	const attackerOptions = allCharacters
		?.map((it) => it.full)
		.filter(Boolean)
		.filter((attacker) =>
			characters.every((defender) => defender._id !== attacker._id),
		)

	const [attackerId, setAttackerId] = useState<NormalizedCharacter["_id"]>()
	const attacker =
		attackerOptions?.find((it) => it._id === attackerId) ??
		attackerOptions?.find((it) => it.playerId === user?._id) ??
		attackerOptions?.[0]

	const [attributeSelected, setAttributeSelected] =
		useState<keyof NormalizedCharacter["attributes"]>()

	const attribute =
		attributeSelected ??
		(attacker
			? // lol
				(Object.entries(attacker.attributes).toSorted(
					(a, b) => b[1] - a[1],
				)[0]?.[0] as keyof NormalizedCharacter["attributes"])
			: "strength")

	const [pushYourself, setPushYourself] = useState(false)
	const [sneakAttack, setSneakAttack] = useState(false)

	const attack = useMutation(api.characters.attack)

	const [, action] = useToastAction(async () => {
		if (!attacker) {
			throw new Error("Unexpected: no attacker")
		}
		await attack({
			characterIds: characters.map((it) => it._id),
			attackerId: attacker._id,
			attribute,
			pushYourself,
			sneakAttack,
		})
		props.setOpen?.(false)
	})

	return (
		<Dialog.Root {...props}>
			<Dialog.Content
				title="Attack"
				description="I hope you know what you're doing."
			>
				<form action={action} className="contents">
					<Field label="Targets">
						<div className="mt-1 flex flex-wrap gap-4">
							{characters.map((it) => (
								<div key={it._id} className="flex items-center gap-2">
									{it.imageId ? (
										<img
											src={getImageUrl(it.imageId)}
											alt=""
											className={lightPanel("size-8 rounded-full")}
										/>
									) : (
										<div
											className={lightPanel(
												"flex size-8 items-center justify-center rounded-full",
											)}
										>
											<LucideVenetianMask className="size-5" />
										</div>
									)}
									{it.identity?.name ?? "(unknown)"}
								</div>
							))}
						</div>
					</Field>
					<div className="flex gap *:flex-1">
						<Select
							label="Attacker"
							value={attacker?._id ?? ""}
							options={[
								{ name: "Choose one", value: "" },
								...(attackerOptions ?? [])?.map((it) => ({
									name: it.name,
									value: it._id,
								})),
							]}
							onChangeValue={(value) => {
								if (value !== "") setAttackerId(value)
							}}
						/>
						<Select
							label="Attribute / Aspect"
							value={attribute}
							options={[
								{ name: "Strength / Fire", value: "strength" },
								{ name: "Sense / Water", value: "sense" },
								{ name: "Mobility / Wind", value: "mobility" },
								{ name: "Intellect / Light", value: "intellect" },
								{ name: "Wit / Darkness", value: "wit" },
							]}
							onChangeValue={setAttributeSelected}
						/>
					</div>
					<div className="flex gap-2 empty:hidden">
						{attacker && attacker.resolve >= 2 && (
							<Checkbox
								label="Push yourself"
								checked={pushYourself}
								onChange={setPushYourself}
							/>
						)}
						{attacker &&
							attacker.resolve >= 3 &&
							attacker.race === "Renari" && (
								<Checkbox
									label="Sneak Attack"
									checked={sneakAttack}
									onChange={setSneakAttack}
								/>
							)}
					</div>
					{attacker ? (
						<Button type="submit" icon={<LucideSwords />}>
							Attack
						</Button>
					) : (
						<p className="flex h-10 items-center text-center">
							No valid attackers found.
						</p>
					)}
				</form>
			</Dialog.Content>
		</Dialog.Root>
	)
}
