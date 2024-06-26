import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useId } from "react"
import { api } from "../../../convex/_generated/api.js"
import { useAsyncState } from "../../helpers/react/hooks.ts"
import { startCase } from "../../helpers/string.ts"
import { Button } from "../../ui/Button.tsx"
import { CheckboxField } from "../../ui/CheckboxField.tsx"
import { DefinitionList } from "../../ui/DefinitionList.tsx"
import { FormField } from "../../ui/Form.tsx"
import { Input } from "../../ui/Input.tsx"
import { ReadOnlyField } from "../../ui/ReadOnlyField.tsx"
import { Select, type SelectOption } from "../../ui/Select.tsx"
import { TextArea } from "../../ui/TextArea.tsx"
import { panel } from "../../ui/styles.ts"
import { ImageUploader } from "../api-images/ImageUploader.tsx"
import { AttributeDiceRollButton } from "../attributes/AttributeDiceRollButton.tsx"
import { getAttribute, type Attribute } from "../attributes/data.ts"
import { MutationButton } from "../convex/MutationButton.tsx"
import { statDiceKinds } from "../dice/data.tsx"
import { listRaces } from "../races/data.ts"
import { RoomOwnerOnly, useRoom } from "../rooms/roomContext.tsx"
import { CharacterImage } from "./CharacterImage.tsx"
import { CharacterModifierFields } from "./CharacterModifierFields.tsx"
import { CharacterReadOnlyGuard } from "./CharacterReadOnlyGuard.tsx"
import { CharacterStatusFields } from "./CharacterStatusFields.tsx"
import { getCharacterFallbackImageUrl, listCharacterRaceAbilities } from "./helpers.ts"
import { useCharacterUpdatePermission } from "./hooks.ts"
import type { ApiCharacter, UpdateableCharacterField } from "./types.ts"

export function CharacterForm({ character }: { character: ApiCharacter }) {
	const room = useRoom()
	const hasUpdatePermissions = useCharacterUpdatePermission(character)
	return (
		<div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-y-auto *:shrink-0">
			<CharacterImageField character={character} />

			<RoomOwnerOnly>
				<CharacterSelectField
					character={character}
					field="playerId"
					label="Player"
					options={[
						...room.players
							.map((p) => ({ label: p.name, value: p.clerkId }))
							.toSorted((a, b) => a.label.localeCompare(b.label)),
						{ id: "none", label: "None", value: null },
					]}
				/>
				<div className="flex flex-wrap gap-3">
					<CharacterCheckboxField character={character} field="visible" />
					<CharacterCheckboxField character={character} field="nameVisible" label="Show Name" />
				</div>
				<MutationButton
					mutationFunction={api.characters.functions.randomize}
					args={{ id: character._id }}
				>
					<Button icon={<Lucide.Shuffle />} text="Randomize" />
				</MutationButton>
			</RoomOwnerOnly>

			{hasUpdatePermissions ?
				<div className="flex gap-2 *:min-w-0 *:flex-1">
					<CharacterInputField character={character} field="name" />
					<CharacterInputField character={character} field="pronouns" />
				</div>
			:	<div className="flex gap-2 *:min-w-0 *:flex-1">
					<ReadOnlyField label="Name" value={character.name ?? "???"} />
					{character.pronouns && <ReadOnlyField label="Pronouns" value={character.pronouns} />}
				</div>
			}

			<CharacterSelectField
				character={character}
				field="race"
				options={[...listRaces().map((r) => ({ value: r.id, label: r.name }))].toSorted((a, b) =>
					a.label.localeCompare(b.label),
				)}
			/>
			<div className={panel("p-3 empty:hidden")}>
				<DefinitionList items={listCharacterRaceAbilities(character)} />
			</div>

			<CharacterStatusFields character={character} />

			{hasUpdatePermissions && (
				<>
					<CharacterDiceField character={character} field="strength" />
					<CharacterDiceField character={character} field="mobility" />
					<CharacterDiceField character={character} field="sense" />
					<CharacterDiceField character={character} field="intellect" />
					<CharacterDiceField character={character} field="wit" />
				</>
			)}

			<CharacterNotesFields character={character} />
		</div>
	)
}

export function CharacterNotesFields({ character }: { character: ApiCharacter }) {
	const room = useRoom()
	return (
		<>
			<CharacterTextAreaField
				character={character}
				field="playerNotes"
				label={room.isOwner ? "Player Notes" : "Notes"}
			/>
			{room.isOwner && (
				<CharacterTextAreaField character={character} field="ownerNotes" label="Owner Notes" />
			)}
		</>
	)
}

function CharacterInputField({
	character,
	field,
	label = startCase(field),
}: {
	character: ApiCharacter
	field: UpdateableCharacterField<string>
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.functions.update))
	const inputId = useId()

	if (character[field] === undefined) {
		return null
	}

	const value = state.args?.[field] ?? character[field] ?? ""
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label} htmlFor={inputId}>
				<Input
					id={inputId}
					value={value}
					onChange={(event) => update({ id: character._id, [field]: event.target.value })}
				/>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}

function CharacterTextAreaField({
	character,
	field,
	label = startCase(field),
}: {
	character: ApiCharacter
	field: UpdateableCharacterField<string>
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.functions.update))

	if (character[field] === undefined) {
		return null
	}

	const value = state.args?.[field] ?? character[field] ?? ""
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label}>
				<TextArea
					value={value}
					onChange={(event) => update({ id: character._id, [field]: event.target.value })}
				/>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}

function CharacterCheckboxField({
	character,
	field,
	label = startCase(field),
}: {
	character: ApiCharacter
	field: UpdateableCharacterField<boolean>
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.functions.update))

	if (character[field] === undefined) {
		return null
	}

	const value = state.args?.[field] ?? character[field] ?? false
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<CheckboxField
				label={label}
				checked={value}
				onChange={(event) => update({ id: character._id, [field]: event.target.checked })}
			/>
		</CharacterReadOnlyGuard>
	)
}

function CharacterSelectField<Field extends UpdateableCharacterField<string | null>>({
	character,
	field,
	label = startCase(field),
	options,
}: {
	character: ApiCharacter
	field: Field
	label?: string
	options: Array<SelectOption<NonNullable<ApiCharacter[Field]> | null>>
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.functions.update))

	if (character[field] === undefined) {
		return null
	}

	const value = state.args?.[field] ?? character[field]
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<Select
				label={label}
				value={value}
				options={options}
				onChange={(value) => update({ id: character._id, [field]: value })}
			/>
		</CharacterReadOnlyGuard>
	)
}

function CharacterDiceField({
	character,
	field,
	label = startCase(field),
}: {
	character: ApiCharacter
	field: Attribute["id"]
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.functions.update))

	if (character[field] === undefined) {
		return null
	}

	const value = state.args?.[field] ?? character[field]
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<div className="flex items-end gap-2">
				<Select
					label={label}
					options={statDiceKinds.map((kind, index) => ({
						id: kind.name,
						label: kind.name,
						value: index + 1,
					}))}
					value={value}
					onChange={(value) => update({ id: character._id, [field]: value })}
					className="flex-1"
				/>
				<CharacterModifierFields character={character} attribute={getAttribute(field)} />
				<AttributeDiceRollButton characters={[{ ...character, ...state.args }]} attribute={field} />
			</div>
		</CharacterReadOnlyGuard>
	)
}

function CharacterImageField({ character }: { character: ApiCharacter }) {
	const hasUpdatePermission = useCharacterUpdatePermission(character)
	const update = useMutation(api.characters.functions.update)
	const fallbackUrl = getCharacterFallbackImageUrl(character)
	return hasUpdatePermission ?
			<FormField label="Image">
				<ImageUploader
					imageId={character.imageId}
					fallbackUrl={fallbackUrl}
					onUpload={(imageId) => update({ id: character._id, imageId })}
					onRemove={() => update({ id: character._id, imageId: null })}
				/>
			</FormField>
		:	<CharacterImage character={character} className="aspect-square" />
}
