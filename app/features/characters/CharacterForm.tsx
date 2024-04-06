import { useConvex, useMutation } from "convex/react"
import type { FunctionArgs } from "convex/server"
import * as Lucide from "lucide-react"
import { type ReactNode, useEffect, useId, useState } from "react"
import { startCase } from "#app/common/string.js"
import type { PickByValue } from "#app/common/types.js"
import { useAsyncState } from "#app/common/useAsyncState.js"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { Button } from "#app/ui/Button.tsx"
import { CheckboxField } from "#app/ui/CheckboxField.js"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { Loading } from "#app/ui/Loading.tsx"
import { Select, type SelectOption, type SelectValue } from "#app/ui/Select.js"
import { TextArea } from "#app/ui/TextArea.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import type { ResultQueryData } from "#convex/resultResponse.js"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { statDiceKinds } from "../dice/diceKinds.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { AttributeDiceRollButton } from "./AttributeDiceRollButton.tsx"
import { Races, RacesByName } from "./races.ts"

export type Character = ResultQueryData<typeof api.characters.list>[number]

export function CharacterForm({ character }: { character: Character }) {
	const room = useRoom()
	const race = (character.race && RacesByName.get(character.race)) || undefined
	return (
		<div className="-m-1 flex h-full min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1 *:shrink-0">
			{character.isOwner ?
				<CharacterImageField character={character} />
			:	<UploadedImage id={character.imageId} />}

			{character.isOwner ?
				<div className="flex gap-2 *:min-w-0 *:flex-1">
					<CharacterInputField character={character} field="name" />
					<CharacterInputField character={character} field="pronouns" />
				</div>
			:	<div className="flex gap-2 *:min-w-0 *:flex-1">
					<ReadOnlyField label="Name" value={character.displayName} />
					<ReadOnlyField label="Pronouns" value={character.displayPronouns} />
				</div>
			}

			{room.isOwner && (
				<CharacterSelectField
					character={character}
					field="playerId"
					label="Player"
					options={[
						{ label: "None", value: null },
						...room.players.map((p) => ({ label: p.name, value: p.clerkId })),
					]}
				/>
			)}

			{room.isOwner && (
				<div className="flex flex-wrap gap-3">
					<CharacterCheckboxField character={character} field="visible" />
					<CharacterCheckboxField character={character} field="nameVisible" label="Show Name" />
				</div>
			)}

			{character.isOwner && (
				<div className="flex gap-2 *:flex-1">
					<CharacterNumberField
						character={character}
						field="damage"
						label={`Damage / ${character.damageThreshold}`}
					/>
					<CharacterNumberField
						character={character}
						field="fatigue"
						label={`Fatugue / ${character.fatigueThreshold}`}
					/>
					<CharacterNumberField character={character} field="currency" />
				</div>
			)}

			{character.isOwner && (
				<>
					<CharacterDiceField character={character} field="strength" stress={character.damage} />
					<CharacterDiceField character={character} field="mobility" stress={character.damage} />
					<CharacterDiceField character={character} field="sense" stress={character.fatigue} />
					<CharacterDiceField character={character} field="intellect" stress={character.fatigue} />
					<CharacterDiceField character={character} field="wit" stress={character.fatigue} />
				</>
			)}

			<CharacterSelectField
				character={character}
				field="race"
				options={Races.map((race) => ({ label: race.name, value: race.name }))}
			/>

			{race && (
				<FormField label="Skills">
					<ul className={panel("grid gap-3 text-wrap p-3")}>
						{race.abilities.map((ability) => (
							<li key={ability.name}>
								<h3 className="text-lg/tight font-light">{ability.name}</h3>
								<p className="text-sm font-medium text-primary-800">{ability.description}</p>
							</li>
						))}
					</ul>
				</FormField>
			)}

			{character.isOwner && (
				<CharacterTextAreaField
					character={character}
					field="playerNotes"
					label={room.isOwner ? "Player Notes" : "Notes"}
				/>
			)}
			{room.isOwner && (
				<CharacterTextAreaField character={character} field="ownerNotes" label="Owner Notes" />
			)}
		</div>
	)
}

/**
 * A field on the character document which also can be updated, so it excludes computed fields, like
 * damage thresholds
 */
type UpdateableCharacterField<ValueType> = Extract<
	keyof PickByValue<Character, ValueType>,
	keyof FunctionArgs<typeof api.characters.update>
>

function CharacterInputField({
	character,
	field,
	label = startCase(field),
}: {
	character: Character
	field: UpdateableCharacterField<string>
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.update))
	const inputId = useId()
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
	character: Character
	field: UpdateableCharacterField<string>
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.update))
	const inputId = useId()
	const value = state.args?.[field] ?? character[field] ?? ""
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label} htmlFor={inputId}>
				<TextArea
					id={inputId}
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
	character: Character
	field: UpdateableCharacterField<boolean>
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.update))
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

function CharacterNumberField({
	character,
	field,
	label = startCase(field),
}: {
	character: Character
	field: UpdateableCharacterField<number>
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.update))
	const value = state.args?.[field] ?? character[field] ?? 0
	const [inputElement, inputRef] = useState<HTMLInputElement | null>()
	const inputId = useId()

	function setValue(newValue: number) {
		if (!Number.isFinite(newValue)) {
			newValue = 0
		}
		update({ id: character._id, [field]: Math.max(0, Math.round(newValue)) })
	}

	useEffect(() => {
		if (!inputElement) return

		const handleWheel = (event: WheelEvent) => {
			if (document.activeElement === event.currentTarget && event.deltaY !== 0) {
				event.preventDefault()
				event.stopPropagation()
				setValue(value - Math.sign(event.deltaY))
			}
		}
		inputElement.addEventListener("wheel", handleWheel, { passive: false })
		return () => {
			inputElement.removeEventListener("wheel", handleWheel)
		}
	})

	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label} htmlFor={inputId}>
				<Input
					type="number"
					id={inputId}
					elementRef={inputRef}
					min={0}
					value={value}
					onChange={(event) => setValue(event.target.valueAsNumber)}
				/>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}

function CharacterSelectField<Field extends UpdateableCharacterField<SelectValue>>({
	character,
	field,
	label = startCase(field),
	options,
}: {
	character: Character
	field: Field
	label?: string
	options: SelectOption<Character[Field]>[]
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.update))
	const inputId = useId()
	const value = state.args?.[field] ?? character[field]
	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label} htmlFor={inputId}>
				<Select
					value={value}
					options={options}
					onChange={(value) => update({ id: character._id, [field]: value })}
				/>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}

function CharacterDiceField({
	character,
	field,
	stress,
	label = startCase(field),
}: {
	character: Character
	field: UpdateableCharacterField<number>
	stress?: number
	label?: string
}) {
	const [state, update] = useAsyncState(useMutation(api.characters.update))
	const value = state.args?.[field] ?? character[field]
	const inputId = useId()

	return (
		<CharacterReadOnlyGuard character={character} label={label} value={value}>
			<FormField label={label} htmlFor={inputId}>
				<div className="flex gap-2">
					<Select
						id={inputId}
						options={statDiceKinds.map((kind) => ({
							label: kind.name,
							value: kind.faces.length,
						}))}
						value={value}
						onChange={(value) => update({ id: character._id, [field]: value })}
						className="flex-1"
					/>
					<AttributeDiceRollButton
						attributeValue={value}
						buttonLabel={`Roll ${label} for ${character.name}`}
						messageContent={`${character.name}: ${label}`}
						stress={stress ?? 0}
					/>
				</div>
			</FormField>
		</CharacterReadOnlyGuard>
	)
}

function CharacterImageField({
	character,
}: {
	character: { _id: Id<"characters">; imageId?: Id<"_storage"> | null }
}) {
	const update = useMutation(api.characters.update)
	const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle")
	const convex = useConvex()
	const inputId = useId()

	async function upload(file: File) {
		setStatus("uploading")
		try {
			await update({
				id: character._id,
				imageId: await uploadImage(file, convex),
			})
			setStatus("idle")
		} catch (error) {
			console.error(error)
			setStatus("error")
		}
	}

	return (
		<FormField label="Image" htmlFor={inputId}>
			<div className="relative flex aspect-square w-full items-center justify-center overflow-clip rounded border border-dashed border-primary-300 bg-primary-200/50 transition hover:bg-primary-200/75">
				{status === "idle" && (
					<UploadedImage
						id={character.imageId}
						emptyIcon={<Lucide.ImagePlus />}
						className="size-full"
					/>
				)}
				{status === "uploading" && <Loading />}
				{status === "error" && <Lucide.FileX2 />}
				<input
					id={inputId}
					aria-label="Upload image"
					type="file"
					className="absolute inset-0 opacity-0"
					accept="image/*"
					onChange={(event) => {
						const file = event.target.files?.[0]
						event.target.value = ""
						if (file) {
							upload(file)
						}
					}}
				/>
				{character.imageId && (
					<Button
						icon={<Lucide.Trash />}
						title="Remove image"
						onClick={async () => {
							await update({ id: character._id, imageId: null })
						}}
						className="absolute right-0 top-0 m-2"
					/>
				)}
			</div>
		</FormField>
	)
}

function CharacterReadOnlyGuard({
	character,
	label,
	value,
	children,
}: {
	character: Character
	label: string
	value: ReactNode
	children: React.ReactNode
}) {
	return character.isOwner ? children : <ReadOnlyField label={label} value={value} />
}

function ReadOnlyField({ label, value }: { label: string; value: ReactNode }) {
	return (
		<FormField label={label}>
			<div
				className={panel(
					"flex h-10 items-center justify-between gap-1.5 bg-primary-300/30 pl-3 pr-2",
				)}
			>
				<p className="flex-1 truncate">{value}</p>
				<Tooltip
					text="Read-only"
					className="-m-2 rounded p-2 opacity-25 transition-opacity hover:opacity-50 focus-visible:opacity-50"
				>
					<Lucide.Ban className="size-4" />
					<span className="sr-only">Read-only</span>
				</Tooltip>
			</div>
		</FormField>
	)
}
