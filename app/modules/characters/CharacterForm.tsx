import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useId } from "react"
import { ConfirmModalButton } from "~/ui/ConfirmModalButton.tsx"
import { Panel } from "~/ui/Panel.tsx"
import { api } from "../../../convex/_generated/api.js"
import { useAsyncState } from "../../helpers/react/hooks.ts"
import { startCase } from "../../helpers/string.ts"
import { Button } from "../../ui/Button.tsx"
import { CheckboxField } from "../../ui/CheckboxField.tsx"
import { FormField, useField } from "../../ui/Form.tsx"
import { Input } from "../../ui/Input.tsx"
import { ReadOnlyField } from "../../ui/ReadOnlyField.tsx"
import { Select, type SelectOption } from "../../ui/Select.tsx"
import { TextArea } from "../../ui/TextArea.tsx"
import { ImageUploader } from "../api-images/ImageUploader.tsx"
import type { Attribute } from "../attributes/data.ts"
import { statDiceKinds } from "../dice/data.tsx"
import { listRaces } from "../races/data.ts"
import { RoomOwnerOnly, useRoom } from "../rooms/roomContext.tsx"
import { CharacterAbilityList } from "./CharacterAbilityList.tsx"
import { CharacterImage } from "./CharacterImage.tsx"
import { CharacterReadOnlyGuard } from "./CharacterReadOnlyGuard.tsx"
import { CharacterStatusFields } from "./CharacterStatusFields.tsx"
import { getCharacterFallbackImageUrl } from "./helpers.ts"
import { useCharacterUpdatePermission } from "./hooks.ts"
import type { ApiCharacter, UpdateableCharacterField } from "./types.ts"

export function CharacterForm({ character }: { character: ApiCharacter }) {
	const room = useRoom()
	const hasUpdatePermissions = useCharacterUpdatePermission(character)
	const randomize = useMutation(api.characters.functions.randomize)
	return (
		<div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-y-auto *:shrink-0">
			<RoomOwnerOnly>
				<div className="flex items-end gap-current *:flex-1">
					<CharacterSelectField
						character={character}
						field="player"
						label="Player"
						options={[
							...room.players
								.map((p) => ({ label: p.name, value: p._id }))
								.toSorted((a, b) => a.label.localeCompare(b.label)),
							{ id: "none", label: "None", value: null },
						]}
					/>
					<ConfirmModalButton
						title="Randomize character"
						message="This will randomize all attributes and dice rolls. Are you sure?"
						confirmText="Yes, randomize"
						confirmIcon={<Lucide.Shuffle />}
						cancelText="No, keep current values"
						cancelIcon={<Lucide.X />}
						onConfirm={() => randomize({ id: character._id })}
						render={<Button icon={<Lucide.Shuffle />} text="Randomize" />}
					/>
				</div>
				<div className="flex flex-wrap gap-current">
					<CharacterCheckboxField character={character} field="visible" />
					<CharacterCheckboxField character={character} field="nameVisible" label="Show Name" />
				</div>
				<hr />
			</RoomOwnerOnly>

			<div className="flex gap-current">
				<div className="flex flex-1 flex-col gap-current">
					<CharacterImageField character={character} />
					{hasUpdatePermissions ?
						<>
							<CharacterInputField character={character} field="name" />
							<CharacterInputField character={character} field="pronouns" />
						</>
					:	<>
							<ReadOnlyField label="Name" value={character.name ?? "???"} />
							{character.pronouns && <ReadOnlyField label="Pronouns" value={character.pronouns} />}
						</>
					}
					<CharacterSelectField
						character={character}
						field="race"
						options={[...listRaces().map((r) => ({ value: r.id, label: r.name }))].toSorted(
							(a, b) => a.label.localeCompare(b.label),
						)}
					/>
				</div>
				{hasUpdatePermissions && (
					<div className="flex flex-col gap-current">
						<Panel className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-3">
							<AttributePoints character={character} />
							<CharacterAttributeField character={character} field="strength" />
							<CharacterAttributeField character={character} field="mobility" />
							<CharacterAttributeField character={character} field="sense" />
							<CharacterAttributeField character={character} field="intellect" />
							<CharacterAttributeField character={character} field="wit" />
						</Panel>
					</div>
				)}
			</div>

			{hasUpdatePermissions && (
				<div className="grid grid-flow-col gap-current">
					<CharacterStatusFields character={character} />
				</div>
			)}

			<CharacterNotesFields character={character} />

			<FormField label="Abilities">
				<Panel className="p-3 empty:hidden">
					<CharacterAbilityList character={character} />
				</Panel>
			</FormField>
		</div>
	)
}

function AttributePoints({ character }: { character: Required<ApiCharacter> }) {
	const total =
		character.strength + character.mobility + character.sense + character.intellect + character.wit
	const max = 15
	return (
		<p className="text-center text-lg/tight font-light">
			Attribute points:{" "}
			<strong
				className={
					total < max ? "text-green-400"
					: total > max ?
						"text-red-400"
					:	""
				}
			>
				{total}/{max}
			</strong>
		</p>
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

function CharacterAttributeField({
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
	const DiceComponent = statDiceKinds[value - 1]?.Component
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<div className="flex items-end gap-2">
				<FormField label={label}>
					<DotCounterInput
						count={5}
						value={value}
						onChange={(value) => update({ id: character._id, [field]: value })}
					/>
				</FormField>
				<div className="size-12">{DiceComponent && <DiceComponent />}</div>
				{/* <CharacterModifierFields character={character} attribute={getAttribute(field)} />
				<AttributeDiceRollButton characters={[{ ...character, ...state.args }]} attribute={field} /> */}
			</div>
		</CharacterReadOnlyGuard>
	)
}

/** Renders a horizontal list of circles to represent a counter. */
function DotCounterInput({
	count,
	value,
	onChange,
	...props
}: {
	count: number
	value: number
	onChange: (value: number) => void
} & React.HTMLAttributes<HTMLDivElement>) {
	const { inputId } = useField()
	return (
		<div className="-mx-1.5 flex items-center px-1 py-1" {...props}>
			{[...Array(count).keys()].map((index) => (
				<label
					key={index}
					htmlFor={`${inputId}-${index}`}
					className="block px-1 leading-none transition-transform will-change-transform hover:-translate-y-0.5 active:translate-y-0 active:duration-0"
				>
					<input
						type="radio"
						id={`${inputId}-${index}`}
						name={inputId}
						value={index + 1}
						checked={value === index + 1}
						onChange={(event) => onChange(Number(event.target.value))}
						data-filled={value >= index + 1 || undefined}
						className="block size-6 appearance-none rounded-full border-2 border-white bg-opacity-25 transition-colors checked:border-primary-800 data-[filled]:border-primary-800 data-[filled]:bg-primary-800"
					/>
					<span className="sr-only">{index + 1}</span>
				</label>
			))}
		</div>
	)
}

function CharacterImageField({ character }: { character: ApiCharacter }) {
	const hasUpdatePermission = useCharacterUpdatePermission(character)
	const update = useMutation(api.characters.functions.update)
	const fallbackUrl = getCharacterFallbackImageUrl(character)
	return hasUpdatePermission ?
			<ImageUploader
				imageId={character.imageId}
				fallbackUrl={fallbackUrl}
				onUpload={(imageId) => update({ id: character._id, imageId })}
				onRemove={() => update({ id: character._id, imageId: null })}
			/>
		:	<CharacterImage character={character} className="aspect-square" />
}
