import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import {
	type ComponentPropsWithoutRef,
	type ReactNode,
	useId,
	useState,
} from "react"
import { z } from "zod"
import { expect } from "#app/common/expect.ts"
import {
	type CharacterField,
	characterFieldDice,
	characterFields,
	characterFieldsById,
} from "#app/features/characters/fields.ts"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { Button } from "#app/ui/Button.tsx"
import { FormField } from "#app/ui/FormField.tsx"
import { Input } from "#app/ui/Input.tsx"
import { Loading } from "#app/ui/Loading.tsx"
import { Select } from "#app/ui/Select.tsx"
import { api } from "#convex/_generated/api.js"
import type { Doc, Id } from "#convex/_generated/dataModel.js"
import type { CharacterValue } from "#convex/characters.ts"

export function CharacterForm({ character }: { character: Doc<"characters"> }) {
	const valuesById = Object.fromEntries(
		character.values?.map((value) => [value.key, value.value]) ?? [],
	)

	const [updates, setUpdates] = useState<
		Partial<{
			name: string
			[fieldKey: string]: CharacterValue
		}>
	>({})

	const update = useMutation(api.characters.update)
	const createToken = useMutation(api.mapTokens.create)

	const submit = async () => {
		if (Object.keys(updates).length === 0) return

		const { name, ...updatedValues } = updates
		const newValues = { ...valuesById }

		for (const [key, value] of Object.entries(updatedValues)) {
			if (value !== undefined) {
				newValues[key] = value
			} else {
				delete newValues[key]
			}
		}

		await update({
			id: character._id,
			name: updates.name,
			values: Object.entries(newValues).map(([key, value]) => ({ key, value })),
		})

		setUpdates({})
	}

	return (
		<form action={submit} className="flex h-full flex-col gap-2">
			<fieldset
				className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto *:shrink-0"
				key={character._id}
			>
				<TextField
					label="Name"
					value={updates.name ?? character?.name}
					onChangeValue={(name) =>
						setUpdates((updates) => ({ ...updates, name }))
					}
				/>
				<ImageInput character={character} />
				<Button
					icon={<Lucide.Box />}
					text="Add Token"
					className="self-start"
					onClick={async () => {
						const strengthField = expect(
							characterFieldsById.get("Strength"),
							"No Strength field",
						)

						let strength = Number(valuesById[strengthField.key])
						if (!Number.isFinite(strength))
							strength = strengthField.fallback as number

						await createToken({
							roomSlug: character.roomSlug,
							name: character.name,
							x: 0,
							y: 0,
							imageId: character.imageId,
							health: strength * 2,
							maxHealth: strength * 2,
							fatigue: 0,
						})
					}}
				/>
				{characterFields.map((field) => (
					<CharacterFieldInput
						key={field.key}
						field={field}
						value={updates[field.key] ?? valuesById[field.key]}
						onChange={(value) =>
							setUpdates((updates) => ({ ...updates, [field.key]: value }))
						}
					/>
				))}
			</fieldset>
			<Button
				type="submit"
				icon={<Lucide.Save />}
				text="Save"
				className="self-start"
			/>
		</form>
	)
}

function CharacterFieldInput({
	field,
	value,
	onChange,
}: {
	field: CharacterField
	value: CharacterValue | undefined
	onChange: (value: CharacterValue | undefined) => void
}) {
	const inputId = useId()

	const handleBlur = (
		event: React.FocusEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const form = expect(event.currentTarget.form, "Element has no form")
		form.requestSubmit()
	}

	return (
		<FormField label={field.label} htmlFor={inputId}>
			{field.type === "text" && !field.multiline ? (
				<Input
					id={inputId}
					type="text"
					value={value != null ? String(value) : field.fallback}
					onChange={(event) => {
						onChange(event.target.value)
					}}
					onBlur={handleBlur}
				/>
			) : field.type === "text" && field.multiline ? (
				<textarea
					id={inputId}
					className="min-h-10 w-full min-w-0 rounded border border-primary-300 bg-primary-300/30 px-3 ring-primary-400 ring-inset transition focus:outline-none focus:ring-2"
					rows={3}
					value={value != null ? String(value) : field.fallback}
					onChange={(event) => {
						onChange(event.target.value)
					}}
					onBlur={handleBlur}
				/>
			) : field.type === "die" ? (
				<Select
					options={characterFieldDice.map((value) => ({
						value: String(value),
						label: `d${value}`,
					}))}
					value={
						value != null && typeof value !== "boolean" ? value : field.fallback
					}
					onChange={(value) => {
						onChange(Number(value))
					}}
					onBlur={handleBlur}
				/>
			) : field.type === "counter" ? (
				<Input
					id={inputId}
					type="number"
					value={value != null ? String(value) : field.fallback}
					onChange={(event) => {
						onChange(event.target.value)
					}}
					onBlur={handleBlur}
				/>
			) : null}
		</FormField>
	)
}

function TextField({
	label,
	icon,
	className,
	onChangeValue,
	...props
}: ComponentPropsWithoutRef<"input"> & {
	label: string
	icon?: ReactNode
	onChangeValue: (value: string) => void
}) {
	const inputId = useId()
	return (
		<FormField label={label} className={className} htmlFor={inputId}>
			<Input
				id={inputId}
				type="text"
				icon={icon}
				className="w-full"
				{...props}
				onChange={(event) => {
					onChangeValue(event.target.value)
					props.onChange?.(event)
				}}
				onBlur={(event) => {
					const form = expect(event.currentTarget.form, "Element has no form")
					form.requestSubmit()
				}}
			/>
		</FormField>
	)
}

function ImageInput({ character }: { character: Doc<"characters"> }) {
	const getUploadUrl = useMutation(api.storage.getUploadUrl)
	const createImage = useMutation(api.images.create)
	const updateImage = useMutation(api.images.update)
	const removeImage = useMutation(api.images.remove)
	const updateCharacter = useMutation(api.characters.update)
	const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle")

	async function upload(file: File) {
		setStatus("uploading")
		try {
			const url = await getUploadUrl()

			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			})

			const result = z
				.object({
					storageId: z
						.string()
						.refine((value): value is Id<"_storage"> => true),
				})
				.parse(await response.json())

			if (character.imageId) {
				await updateImage({
					id: character.imageId,
					storageId: result.storageId,
					mimeType: file.type,
				})
			} else {
				const imageId = await createImage({
					storageId: result.storageId,
					mimeType: file.type,
				})
				await updateCharacter({
					id: character._id,
					imageId,
				})
			}

			setStatus("idle")
		} catch (error) {
			console.error(error)
			setStatus("error")
		}
	}

	return (
		<div className="relative flex aspect-square w-full items-center justify-center rounded border border-primary-300 border-dashed bg-primary-200/50 transition hover:bg-primary-200/75">
			{status === "idle" &&
				(character.imageId ? (
					<UploadedImage imageId={character.imageId} className="size-full" />
				) : (
					<Lucide.ImagePlus className="size-full max-w-24 text-primary-400" />
				))}
			{status === "uploading" && <Loading />}
			{status === "error" && <Lucide.FileX2 />}
			<input
				type="file"
				className="absolute inset-0 opacity-0"
				accept="image/*"
				onChange={(event) => {
					const file = event.target.files?.[0]
					if (file) {
						upload(file)
					}
					event.target.value = ""
				}}
			/>
			{character.imageId && (
				<Button
					icon={<Lucide.Trash />}
					title="Remove image"
					onClick={async () => {
						await updateCharacter({ id: character._id, imageId: undefined })
						await removeImage({ id: character.imageId as Id<"images"> })
					}}
					className="absolute top-0 right-0 m-2"
				/>
			)}
		</div>
	)
}
