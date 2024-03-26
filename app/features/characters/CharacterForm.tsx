import { useConvex, useMutation, useQuery } from "convex/react"
import * as Lucide from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { expect } from "#app/common/expect.js"
import { clamp } from "#app/common/math.js"
import { startCase } from "#app/common/string.js"
import type { PickByValue } from "#app/common/types.js"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { Button } from "#app/ui/Button.tsx"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { Loading } from "#app/ui/Loading.tsx"
import { Select } from "#app/ui/Select.js"
import { TextArea } from "#app/ui/TextArea.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import type { ResultQueryData } from "#convex/resultResponse.js"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { numericDiceKinds } from "../dice/diceKinds.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoom } from "../rooms/roomContext.tsx"
import { AttributeDiceRollButton } from "./AttributeDiceRollButton.tsx"

export type Character =
	| ResultQueryData<typeof api.characters.list>[number]
	| ResultQueryData<typeof api.characters.getPlayerCharacter>

export function CharacterForm(props: { character: Character }) {
	const room = useRoom()
	const user = useQuery(api.auth.user)
	const updateCharacter = useMutation(api.characters.update)
	const [updates, setUpdates] = useState<Partial<Character>>()
	const character = { ...props.character, ...updates }
	const isCharacterOwner = room.isOwner || character.playerId === user?.data?._id

	useEffect(() => {
		if (!updates) return

		let cancelled = false
		const id = setTimeout(async () => {
			await updateCharacter({ ...updates, id: character._id })
			if (!cancelled) setUpdates(undefined)
		}, 300)

		return () => {
			clearTimeout(id)
			cancelled = true
		}
	}, [updates, character._id, updateCharacter])

	function updateValues(values: Partial<typeof character>) {
		setUpdates((prev) => ({ ...prev, ...values }))
	}

	const baseId = useId()
	const inputId = (name: string) => `${baseId}:${name}`

	function renderInputField(key: keyof PickByValue<Character, string>, label = startCase(key)) {
		return (
			<FormField label={label} htmlFor={inputId(key)}>
				<Input
					id={inputId(key)}
					value={character[key]}
					onChange={(event) => updateValues({ [key]: event.target.value })}
				/>
			</FormField>
		)
	}

	function renderTextAreaField(key: keyof PickByValue<Character, string>, label = startCase(key)) {
		return (
			<FormField label={label} htmlFor={inputId(key)}>
				<TextArea
					id={inputId(key)}
					minRows={3}
					maxRows={16}
					value={character[key]}
					onChange={(event) => updateValues({ [key]: event.target.value })}
				/>
			</FormField>
		)
	}

	function renderNumberField(
		key: keyof PickByValue<Character, number>,
		max?: number,
		label = [startCase(key), max].filter(Boolean).join(" / "),
	) {
		return (
			<FormField label={label} htmlFor={inputId(key)}>
				<NumberInput
					value={character[key]}
					max={max}
					onChangeValue={(value) => updateValues({ [key]: value })}
				/>
			</FormField>
		)
	}

	function renderDiceField(
		key: keyof PickByValue<Character, number>,
		stressKey: "damage" | "fatigue",
	) {
		const label = startCase(key)
		return (
			<FormField label={label} htmlFor={inputId(key)}>
				<div className="flex gap-2">
					<Select
						id={inputId(key)}
						options={numericDiceKinds.map((kind) => ({
							label: kind.name,
							value: kind.faces.length,
						}))}
						value={character[key]}
						onChange={(value) => updateValues({ [key]: value })}
						className="flex-1"
					/>
					<AttributeDiceRollButton
						character={character}
						attributeKey={key}
						stress={character[stressKey]}
					/>
				</div>
			</FormField>
		)
	}

	return (
		<div className="-m-1 flex h-full min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1 *:shrink-0">
			{isCharacterOwner ?
				<ImageInput character={character} />
			:	<UploadedImage id={character.imageId} className="aspect-square w-full" />}

			<div className="flex gap-2 *:min-w-0 *:flex-1">
				{isCharacterOwner ?
					<>
						{renderInputField("name")}
						{renderInputField("pronouns")}
					</>
				:	<>
						<ReadOnlyField label="Name" value={character.name} />
						<ReadOnlyField label="Pronouns" value={character.pronouns} />
					</>
				}
			</div>
			{room.isOwner && (
				<>
					<FormField label="Player" htmlFor={inputId("player")}>
						<Select
							id={inputId("player")}
							options={[
								{ label: "None", value: null },
								...(room.players?.map((player) => ({ label: player.name, value: player._id })) ??
									[]),
							]}
							value={character.playerId}
							onChange={(value) => {
								updateValues({ playerId: value })
							}}
						/>
					</FormField>
					<CheckboxField
						label="Public"
						id={inputId("visibleTo")}
						checked={character.visibleTo === "everyone"}
						onChange={(event) =>
							updateValues({ visibleTo: event.currentTarget.checked ? "everyone" : "owner" })
						}
					/>
					<CheckboxField
						label="Show Token"
						id={inputId("tokenVisibleTo")}
						checked={character.tokenVisibleTo === "everyone"}
						onChange={(event) =>
							updateValues({ tokenVisibleTo: event.currentTarget.checked ? "everyone" : "owner" })
						}
					/>
				</>
			)}

			<div className="flex gap-2 *:flex-1">
				{renderNumberField("damage", character.strength + character.mobility)}
				{renderNumberField("fatigue", character.sense + character.intellect + character.wit)}
				{renderNumberField("currency")}
			</div>

			{isCharacterOwner ?
				<>
					{renderDiceField("strength", "damage")}
					{renderDiceField("sense", "fatigue")}
					{renderDiceField("mobility", "damage")}
					{renderDiceField("intellect", "fatigue")}
					{renderDiceField("wit", "fatigue")}
				</>
			:	(["strength", "sense", "mobility", "intellect", "wit"] as const).map((key) => (
					<ReadOnlyField key={key} label={startCase(key)} value={`d${character[key]}`} />
				))
			}

			{renderTextAreaField("playerNotes", room.isOwner ? "Player Notes" : "Notes")}
			{room.isOwner && renderTextAreaField("ownerNotes", "Owner Notes")}
		</div>
	)
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
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

type NumberInputProps = {
	value: number
	max?: number
	onChangeValue: (value: number) => void
}

export function NumberInput({ value, max, onChangeValue }: NumberInputProps) {
	const ref = useRef<HTMLInputElement>(null)

	function setValue(newValue: number) {
		const clampedValue = clamp(newValue, 0, max ?? Number.POSITIVE_INFINITY)
		onChangeValue(clampedValue)
	}

	useEffect(() => {
		const handleWheel = (event: WheelEvent) => {
			if (document.activeElement === event.currentTarget && event.deltaY !== 0) {
				event.preventDefault()
				event.stopPropagation()
				setValue(value - Math.sign(event.deltaY))
			}
		}
		const element = expect(ref.current, "input ref not set")
		element.addEventListener("wheel", handleWheel, { passive: false })
		return () => {
			element.removeEventListener("wheel", handleWheel)
		}
	})

	return (
		<Input
			type="number"
			value={value}
			min={0}
			max={max}
			elementRef={ref}
			onChange={(event) => setValue(event.target.valueAsNumber)}
		/>
	)
}

function CheckboxField({
	label,
	id,
	checked,
	onChange,
}: {
	label: string
	id: string
	checked: boolean
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
	return (
		<FormField label={label} htmlFor={id} className="flex-row-reverse justify-end gap-1.5">
			<div className="relative flex size-5 items-center justify-center overflow-clip">
				<input
					className="peer size-full appearance-none rounded border-2 border-primary-400 bg-primary-100 transition checked:bg-primary-300/50 hover:bg-primary-200 checked:hover:bg-primary-300 active:border-primary-600 active:duration-0"
					id={id}
					aria-label={label}
					type="checkbox"
					checked={checked}
					onChange={onChange}
				/>
				<Lucide.X
					className="pointer-events-none invisible absolute size-5 text-primary-700 peer-checked:visible"
					strokeWidth={3}
					absoluteStrokeWidth
				/>
			</div>
		</FormField>
	)
}

function ImageInput({
	character,
}: {
	character: { _id: Id<"characters">; imageId: Id<"_storage"> | null }
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
