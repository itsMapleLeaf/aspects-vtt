import { useConvex, useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { UploadedImage } from "#app/features/images/UploadedImage.tsx"
import { Button } from "#app/ui/Button.tsx"
import { Loading } from "#app/ui/Loading.tsx"
import { api } from "#convex/_generated/api.js"
import type { Doc, Id } from "#convex/_generated/dataModel.js"
import type { CharacterField } from "#convex/characters.js"
import { uploadImage } from "../images/uploadImage.ts"
import { CHARACTER_FIELDS, CharacterFormField } from "./characterFields.tsx"

export function CharacterForm({ character }: { character: Doc<"characters"> }) {
	const update = useMutation(api.characters.update)
	const createToken = useMutation(api.mapTokens.create)

	const submit = async (fields: CharacterField[]) => {
		await update({
			id: character._id,
			fields,
		})
	}

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-y-auto *:shrink-0">
			<ImageInput character={character} />
			<Button
				icon={<Lucide.Box />}
				text="Add Token"
				className="self-start"
				onClick={async () => {
					await createToken({
						roomId: character.roomId,
						x: 10,
						y: 10,
						characterId: character._id,
						overrides: character.fields,
					})
				}}
			/>
			{CHARACTER_FIELDS.map((field) => (
				<CharacterFormField
					key={field.label}
					{...field}
					fields={character.fields}
					onSubmit={submit}
				/>
			))}
		</div>
	)
}

function ImageInput({ character }: { character: Doc<"characters"> }) {
	const removeImage = useMutation(api.images.remove)
	const updateCharacter = useMutation(api.characters.update)
	const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle")
	const convex = useConvex()

	async function upload(file: File) {
		setStatus("uploading")
		try {
			await updateCharacter({
				id: character._id,
				imageId: await uploadImage(file, character.imageId, convex),
			})
			setStatus("idle")
		} catch (error) {
			console.error(error)
			setStatus("error")
		}
	}

	return (
		<div className="relative flex aspect-square w-full items-center justify-center overflow-clip rounded border border-primary-300 border-dashed bg-primary-200/50 transition hover:bg-primary-200/75">
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
