import { LucideImagePlus } from "lucide-react"
import { ComponentProps, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { twMerge } from "tailwind-merge"
import { convertBytes } from "~/common/math.ts"
import { StrictOmit } from "~/common/types.ts"
import { panel } from "~/styles/panel.ts"

export interface ImageDropzoneProps
	extends StrictOmit<ComponentProps<"div">, "className"> {
	name?: string
	defaultImageUrl: string | undefined | null
	className?: string | { wrapper?: string; image?: string }
}

export function ImageDropzone({
	name,
	defaultImageUrl,
	className,
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
	}, [dropzone.acceptedFiles[0]])

	const renderedImageUrl = fileUrl ?? defaultImageUrl

	const classes =
		typeof className === "string" ? { wrapper: className } : className

	return (
		<div
			{...dropzone.getRootProps(props)}
			className={panel(
				"group relative grid w-full place-content-center overflow-clip text-balance border border-primary-600 bg-primary-700 text-center transition gap-2 hover:border-primary-500",
				classes?.wrapper,
			)}
		>
			<input {...dropzone.getInputProps({ name })} />
			{renderedImageUrl != null ?
				<>
					<img
						src={renderedImageUrl}
						alt=""
						className={twMerge(
							"absolute inset-0 size-full object-cover transition group-hover:opacity-50",
							classes?.image,
						)}
					/>
					<LucideImagePlus className="aspect-square size-16 max-w-[max(theme(spacing.16),100%-theme(spacing.2))] opacity-0 transition group-hover:opacity-50" />
				</>
			:	<LucideImagePlus className="aspect-square size-16 max-w-[max(theme(spacing.16),100%-theme(spacing.2))] opacity-25" />
			}
		</div>
	)
}
