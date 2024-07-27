import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import type React from "react"
import { z } from "zod"
import type { Nullish } from "~/helpers/types.ts"
import { Button } from "~/ui/Button.tsx"
import { useField } from "~/ui/Form.tsx"
import { Image } from "~/ui/Image.tsx"
import { Loading } from "~/ui/Loading.tsx"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import { api } from "../../../convex/_generated/api.js"
import type { Id } from "../../../convex/_generated/dataModel"
import { useSafeAction } from "../convex/hooks.js"
import { getApiImageUrl } from "./helpers.js"

export interface ImageUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
	imageId?: Nullish<Id<"_storage">>
	fallbackUrl?: string
	onUpload: (imageId: Id<"_storage">, file: File) => Promise<unknown>
	onRemove: () => Promise<unknown>
}

export function ImageUploader(props: ImageUploaderProps) {
	return <ImageUploaderView {...useImageUploaderState(props)} />
}

function useImageUploaderState({ imageId, fallbackUrl, onUpload, ...props }: ImageUploaderProps) {
	const getUploadUrl = useMutation(api.storage.getUploadUrl)
	const removeFile = useMutation(api.storage.remove)

	const [state, upload, pending] = useSafeAction(async function upload(file: File) {
		const url = await getUploadUrl({})
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": file.type },
			body: file,
		})
		const result = uploadResultSchema.parse(await response.json())

		try {
			await onUpload(result.storageId, file)
		} catch (error) {
			await removeFile({ storageId: result.storageId })
			throw error
		}
	})

	return {
		...props,
		src: imageId ? getApiImageUrl(imageId) : undefined,
		fallbackUrl,
		state,
		pending,
		onFileAdded: upload,
	}
}

function ImageUploaderView({
	src,
	fallbackUrl,
	onFileAdded,
	onRemove,
	state,
	pending,
	...props
}: ReturnType<typeof useImageUploaderState>) {
	const field = useField()
	const imageUrl = src || fallbackUrl

	return (
		<div
			{...withMergedClassName(
				props,
				"relative flex-center aspect-square w-full overflow-clip rounded border border-primary-300 bg-primary-100 transition hover:bg-primary-200 hover:border-primary-400",
			)}
		>
			{pending ?
				<Loading />
			:	<div className="absolute inset-0" data-image-uploader-preview>
					<Image
						src={imageUrl}
						fallbackIcon={null}
						className={{
							container: "absolute size-full scale-110 blur brightness-50",
							image: "aspect-square object-cover",
						}}
					/>
					<Image
						src={imageUrl}
						fallbackIcon={null}
						className={{
							container: "absolute size-full",
							image: "aspect-square",
						}}
					/>

					<div
						data-state={state.type}
						data-empty={!imageUrl || undefined}
						className="flex-center absolute inset-0 text-pretty bg-primary-100/75 text-center opacity-0 transition-opacity gap-3 data-[empty]:opacity-100 data-[state=error]:opacity-100 [[data-image-uploader-preview]:hover>&]:opacity-100"
					>
						<div className="aspect-square w-full max-w-16 opacity-50 *:size-full">
							{state.type === "error" ?
								<Lucide.FileX2 />
							:	<Lucide.ImagePlus />}
						</div>
						<p className="px-8 opacity-75">
							{state.type === "error" ?
								"Something went wrong, try again."
							:	"Click to upload an image, or drag and drop it here."}
						</p>
					</div>

					<input
						id={field.inputId}
						aria-label="Upload image"
						type="file"
						className="absolute inset-0 opacity-0"
						accept="image/*"
						onChange={(event) => {
							const file = event.target.files?.[0]
							event.target.value = ""
							if (file) onFileAdded(file)
						}}
					/>
				</div>
			}

			{src && !pending && (
				<Button
					icon={<Lucide.Trash />}
					title="Remove image"
					appearance="clear"
					className="absolute right-0 top-0 m-2"
					onClick={async () => {
						await onRemove()
					}}
				/>
			)}
		</div>
	)
}
ImageUploader.View = ImageUploaderView

const uploadResultSchema = z.object({
	storageId: z.string().refine((_value): _value is Id<"_storage"> => true),
})
