import { useConvex, useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import * as Lucide from "lucide-react"
import { useEffect, useState } from "react"
import { range } from "#app/common/range.js"
import { startCase } from "#app/common/string.js"
import type { PickByValue } from "#app/common/types.js"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { Button } from "#app/ui/Button.tsx"
import { FormField } from "#app/ui/FormField.js"
import { Input } from "#app/ui/Input.js"
import { Loading } from "#app/ui/Loading.tsx"
import { Select } from "#app/ui/Select.js"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { diceKinds } from "../dice/diceKinds.tsx"
import { uploadImage } from "../images/uploadImage.ts"
import { useRoom } from "../rooms/roomContext.tsx"

type Character =
	| NonNullable<FunctionReturnType<typeof api.characters.list>["data"]>[number]
	| NonNullable<FunctionReturnType<typeof api.characters.getPlayerCharacter>["data"]>

export function CharacterForm(props: {
	character: Character
}) {
	const room = useRoom()
	const updateCharacter = useMutation(api.characters.update)
	const [updates, setUpdates] = useState<Partial<Character>>()
	const character = { ...props.character, ...updates }
	const createDiceRoll = useMutation(api.diceRolls.create)

	useEffect(
		function syncCharacter() {
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
		},
		[updates, character._id, updateCharacter],
	)

	const updateValues = (values: Partial<typeof character>) => {
		setUpdates((prev) => ({ ...prev, ...values }))
	}

	function renderTextField(key: keyof PickByValue<Character, string>, label = startCase(key)) {
		return (
			<FormField label={label} htmlFor={key}>
				<Input
					id={key}
					value={character[key]}
					onChange={(event) => updateValues({ [key]: event.target.value })}
				/>
			</FormField>
		)
	}

	function renderMultilineTextField(
		key: keyof PickByValue<Character, string>,
		label = startCase(key),
	) {
		return (
			<FormField label={label} htmlFor={key}>
				<Input
					id={key}
					value={character[key]}
					multiline
					onChange={(event) => updateValues({ [key]: event.target.value })}
				/>
			</FormField>
		)
	}

	function renderNumberField(key: keyof PickByValue<Character, number>, label = startCase(key)) {
		return (
			<FormField label={label} htmlFor={key}>
				<Input
					id={key}
					type="number"
					value={character[key]}
					onChange={(event) => updateValues({ [key]: event.target.valueAsNumber })}
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
			<FormField label={label} htmlFor={key}>
				<div className="flex gap-2">
					<Select
						id={key}
						options={diceKinds.map((kind) => ({
							label: `d${kind.sides}`,
							value: kind.sides,
						}))}
						value={character[key]}
						onChange={(value) => updateValues({ [key]: value })}
						className="flex-1"
					/>
					<Button
						icon={<Lucide.Dices />}
						title={`Roll ${label}`}
						onClick={async () => {
							await createDiceRoll({
								roomId: room._id,
								label: `${character.name}: ${label}`,
								dice: [
									{ sides: character[key] },
									...range.array(character[stressKey]).map(() => ({ sides: 6 })),
								],
							})
						}}
					/>
				</div>
			</FormField>
		)
	}

	return (
		<div className="-m-1 flex h-full min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1 *:shrink-0">
			<div className="flex gap-2 *:flex-1">
				{renderTextField("name")}
				{renderTextField("pronouns")}
			</div>

			{room.isOwner && room.players && "playerId" in character && (
				<FormField label="Player" htmlFor="player">
					<Select
						options={[
							{ label: "None", value: null },
							...room.players.map((player) => ({ label: player.name, value: player._id })),
						]}
						value={character.playerId}
						onChange={(value) => {
							updateValues({ playerId: value })
						}}
					/>
				</FormField>
			)}

			<ImageInput character={character} />

			<div className="flex gap-2 *:flex-1">
				{renderNumberField("damage", `Damage / ${character.strength + character.mobility}`)}
				{renderNumberField(
					"fatigue",
					`Fatigue / ${character.sense + character.intellect + character.wit}`,
				)}
				{renderNumberField("currency")}
			</div>

			{renderDiceField("strength", "damage")}
			{renderDiceField("sense", "fatigue")}
			{renderDiceField("mobility", "damage")}
			{renderDiceField("intellect", "fatigue")}
			{renderDiceField("wit", "fatigue")}

			{room.isOwner
				? renderMultilineTextField("ownerNotes", "Notes")
				: renderMultilineTextField("playerNotes", "Notes")}
		</div>
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
		<div className="relative flex aspect-square w-full items-center justify-center overflow-clip rounded border border-primary-300 border-dashed bg-primary-200/50 transition hover:bg-primary-200/75">
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
					className="absolute top-0 right-0 m-2"
				/>
			)}
		</div>
	)
}
