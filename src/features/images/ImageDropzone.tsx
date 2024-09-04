import { LucideImagePlus } from "lucide-react"
import { ComponentProps, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { convertBytes } from "../../lib/math.ts"
import { panel } from "../../ui/styles.ts"

export interface ImageDropzoneProps extends ComponentProps<"div"> {
	name?: string
	defaultImageUrl: string | undefined | null
}

export function ImageDropzone({
	name,
	defaultImageUrl,
	...props
}: ImageDropzoneProps) {
	const dropzone = useDropzone({
		accept: {
			"image/png": [],
			"image/jpeg": [],
			"image/webp": [],
		},
		maxSize: convertBytes(20, "MB", "B"),
	})

	const fileUrl = useMemo(() => {
		const file = dropzone.acceptedFiles[0]
		return file && URL.createObjectURL(file)
	}, [dropzone.acceptedFiles])

	const renderedImageUrl = fileUrl ?? defaultImageUrl

	return (
		<div
			{...dropzone.getRootProps(props)}
			className={panel(
				"group relative grid aspect-video place-content-center overflow-clip text-balance text-center transition gap-2 hover:bg-primary-600",
				props.className,
			)}
		>
			<input {...dropzone.getInputProps({ name })} />
			{renderedImageUrl != null ?
				<>
					<img
						src={renderedImageUrl}
						alt=""
						className="absolute inset-0 size-full object-cover transition group-hover:opacity-50"
					/>
					<LucideImagePlus className="aspect-square size-16 max-w-[max(theme(spacing.16),100%-theme(spacing.2))] opacity-0 transition group-hover:opacity-50" />
				</>
			:	<LucideImagePlus className="aspect-square size-16 max-w-[max(theme(spacing.16),100%-theme(spacing.2))] opacity-25" />
			}
		</div>
	)
}
