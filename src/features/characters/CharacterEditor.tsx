import { useMutation } from "convex/react"
import {
	LucideCopy,
	LucideHeartPulse,
	LucidePackage,
	LucideSparkles,
	LucideTrash,
	LucideUserRound,
	LucideWrench,
} from "lucide-react"
import * as v from "valibot"
import { useLocalStorage } from "~/common/react/dom.ts"
import { usePatchUpdate } from "~/common/react/usePatchUpdate.ts"
import { Checkbox } from "~/components/Checkbox.tsx"
import { Field } from "~/components/Field.tsx"
import { HeadingLevel } from "~/components/Heading.tsx"
import { NumberInput } from "~/components/NumberInput.tsx"
import { Select } from "~/components/Select.tsx"
import { Tabs } from "~/components/Tabs.tsx"
import { api } from "~/convex/_generated/api"
import { Id } from "~/convex/_generated/dataModel"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterInventoryEditor } from "~/features/characters/CharacterInventoryEditor.tsx"
import { CharacterPlayerSelect } from "~/features/characters/CharacterPlayerSelect.tsx"
import { CharacterProfileEditor } from "~/features/characters/CharacterProfileEditor.tsx"
import { CharacterSkillsEditor } from "~/features/characters/CharacterSkillsEditor.tsx"
import { WealthTierSelect } from "~/features/characters/WealthTierSelect.tsx"
import { textInput } from "~/styles/input.ts"
import { ensure } from "../../../shared/errors.ts"
import { Button } from "../../components/Button.tsx"
import { ToastActionForm } from "../../components/ToastActionForm.tsx"
import { useRoomContext } from "../rooms/context.tsx"
import { CharacterConditionsInput } from "./CharacterConditionsInput.tsx"
import { CharacterToggleCombatMemberButton } from "./CharacterToggleCombatMemberButton.tsx"
import { CharacterToggleTokenButton } from "./CharacterToggleTokenButton.tsx"

export function CharacterEditor({
	character,
	afterClone,
}: {
	character: NormalizedCharacter
	afterClone: (characterId: Id<"characters">) => void
}) {
	const room = useRoomContext()

	const [activeId, setActiveId] = useLocalStorage(
		`characterEditorDialog:activeId:${character._id}`,
		"profile",
		v.parser(v.string()),
	)

	return (
		<div className="isolate flex min-h-0 flex-1 flex-col gap-2">
			<Tabs.Root
				selectedId={activeId}
				setSelectedId={(id) => setActiveId((current) => id ?? current)}
			>
				<HeadingLevel>
					<div className="sticky top-0 z-10 flex shrink-0 flex-col bg-primary-800 py-2 gap">
						<Tabs.List>
							<Tabs.Tab id="profile">
								<LucideUserRound /> Profile
							</Tabs.Tab>
							<Tabs.Tab id="status">
								<LucideHeartPulse /> Status
							</Tabs.Tab>
							<Tabs.Tab id="inventory">
								<LucidePackage /> Inventory
							</Tabs.Tab>
							<Tabs.Tab id="skills">
								<LucideSparkles /> Skills
							</Tabs.Tab>
							{room.isOwner && (
								<Tabs.Tab id="manage">
									<LucideWrench /> Manage
								</Tabs.Tab>
							)}
						</Tabs.List>
					</div>

					<Tabs.Panel id="profile" unmountOnHide>
						<CharacterProfileEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="status" unmountOnHide>
						<CharacterStatusEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="inventory" unmountOnHide>
						<CharacterInventoryEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="skills" unmountOnHide>
						<CharacterSkillsEditor character={character} />
					</Tabs.Panel>

					{room.isOwner && (
						<Tabs.Panel id="manage" unmountOnHide>
							<CharacterAdminManagement
								character={character}
								afterClone={afterClone}
							/>
						</Tabs.Panel>
					)}
				</HeadingLevel>
			</Tabs.Root>
		</div>
	)
}

function CharacterStatusEditor({
	character: characterProp,
}: {
	character: NormalizedCharacter
}) {
	const update = useMutation(api.characters.update)
	const { patched: character, update: handleChange } = usePatchUpdate(
		characterProp,
		(patch) => update({ ...patch, characterId: characterProp._id }),
	)

	return (
		<div className="flex flex-col gap-3">
			<div className="grid auto-cols-fr grid-flow-col gap">
				<Field label={`Health`}>
					<div className="flex items-center gap-2">
						<NumberInput
							className={textInput()}
							max={character.healthMax}
							value={character.health}
							onSubmitValue={(value) => handleChange({ health: value })}
						/>
						<div aria-label="out of">/</div>
						<NumberInput
							className={textInput()}
							placeholder={character.healthMax}
							required={false}
							value={character.healthMaxOverride}
							onSubmitValue={(value) =>
								handleChange({ healthMaxOverride: value })
							}
							onSubmitEmpty={() => handleChange({ healthMaxOverride: null })}
						/>
					</div>
				</Field>
				<Field label={`Resolve`}>
					<div className="flex items-center gap-2">
						<NumberInput
							className={textInput()}
							max={character.resolveMax}
							value={character.resolve}
							onSubmitValue={(value) => handleChange({ resolve: value })}
						/>
						<div aria-label="out of">/</div>
						<NumberInput
							className={textInput()}
							placeholder={character.resolveMax}
							required={false}
							value={character.resolveMaxOverride}
							onSubmitValue={(value) =>
								handleChange({ resolveMaxOverride: value })
							}
							onSubmitEmpty={() => handleChange({ resolveMaxOverride: null })}
						/>
					</div>
				</Field>
			</div>

			<WealthTierSelect
				value={character.wealth}
				onChange={(value) => handleChange({ wealth: value })}
			/>

			<CharacterConditionsInput characterIds={[character._id]} />
		</div>
	)
}

function CharacterAdminManagement({
	character: characterProp,
	afterClone,
}: {
	character: NormalizedCharacter
	afterClone: (characterId: Id<"characters">) => void
}) {
	const update = useMutation(api.characters.update)
	const remove = useMutation(api.characters.remove)
	const duplicate = useMutation(api.characters.duplicate)
	const { patched: character, update: handleChange } = usePatchUpdate(
		characterProp,
		(patch) => update({ ...patch, characterId: characterProp._id }),
	)

	return (
		<div className="flex flex-col @container gap-3">
			<div className="grid gap @md:grid-cols-2">
				<CharacterPlayerSelect character={character} />
				<Select
					label="Type"
					options={[
						{
							name: "Player",
							description: "Enforces EXP and attribute limits",
							value: "player",
						},
						{
							name: "NPC",
							value: "npc",
							description: "Removes limits",
						},
					]}
					value={character.type}
					onChangeValue={(value) => handleChange({ type: value })}
				/>
			</div>
			<div className="flex flex-wrap gap">
				<Checkbox
					label="Public"
					checked={character.visible ?? false}
					onChange={(checked) => handleChange({ visible: checked })}
				/>
				<Checkbox
					label="Show name"
					checked={character.nameVisible ?? false}
					onChange={(checked) => handleChange({ nameVisible: checked })}
				/>
			</div>
			<div className="flex flex-wrap gap">
				<CharacterToggleCombatMemberButton characters={[character]} />
				<CharacterToggleTokenButton characters={[character]} />
			</div>
			<div className="flex flex-wrap gap">
				<ToastActionForm
					action={() =>
						duplicate({ characterIds: [character._id] }).then((result) =>
							afterClone(ensure(result[0])),
						)
					}
				>
					<Button type="submit" icon={<LucideCopy />}>
						Clone
					</Button>
				</ToastActionForm>
				<ToastActionForm
					action={() => remove({ characterIds: [character._id] })}
				>
					<Button type="submit" icon={<LucideTrash />}>
						Delete
					</Button>
				</ToastActionForm>
			</div>
		</div>
	)
}
