import { LucideImagePlus } from "lucide-react"
import { startTransition, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { LoadingIcon } from "~/components/LoadingIcon.tsx"
import { useToastAction } from "~/components/ToastActionForm.tsx"
import { panel } from "~/styles/panel.ts"

interface ImageUploaderProps {
	imageUrl: string | null | undefined
	onUpload: (files: readonly [File, ...File[]]) => Promise<void>
	className?: string
}

export function ImageUploader({
	imageUrl,
	onUpload,
	className,
}: ImageUploaderProps) {
	const [, submit, pending] = useToastAction(
		async (_, files: readonly [File, ...File[]]) => {
			await onUpload(files)
		},
		{
			pendingMessage: "Uploading...",
		},
	)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const [first, ...rest] = Array.from(event.target.files || [])
		if (first) {
			startTransition(() => {
				submit([first, ...rest])
			})
		}
		event.target.value = ""
	}

	const [imageLoading, setImageLoading] = useState(false)
	useEffect(() => {
		if (!imageUrl) {
			setImageLoading(false)
			return
		}

		const image = new Image()
		image.src = imageUrl

		if (image.complete) {
			setImageLoading(false)
			return
		}

		setImageLoading(true)

		const controller = new AbortController()

		image.addEventListener("load", () => setImageLoading(false), {
			signal: controller.signal,
		})
		image.addEventListener("error", () => setImageLoading(false), {
			signal: controller.signal,
		})

		return () => {
			controller.abort()
		}
	}, [imageUrl])

	const [over, setOver] = useState(false)

	return (
		<div className={twMerge("group relative aspect-square", className)}>
			<div
				className={panel(
					"absolute inset-0 grid size-full place-content-center overflow-clip border-primary-600 bg-primary-700 text-center transition hover:border-primary-500",
				)}
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt="Character"
						className="absolute inset-0 size-full object-cover object-top transition group-hover:opacity-50 data-over:opacity-50"
						data-over={over || undefined}
					/>
				) : (
					<LucideImagePlus className="size-16 opacity-25" />
				)}
				<LucideImagePlus
					className="absolute inset-0 m-auto size-16 opacity-0 transition group-hover:opacity-50 data-over:opacity-50"
					data-over={over || undefined}
				/>
			</div>
			<div
				className="pointer-events-none invisible absolute inset-0 grid place-content-center bg-primary-900/50 opacity-0 transition-all data-visible:visible data-visible:opacity-100"
				data-visible={pending || imageLoading || undefined}
			>
				<LoadingIcon className="size-12" />
			</div>
			<input
				type="file"
				accept="image/png,image/jpeg,image/webp"
				onChange={handleFileChange}
				className="absolute inset-0 opacity-0"
				onDragEnter={() => setOver(true)}
				onDragLeave={() => setOver(false)}
				onDrop={() => setOver(false)}
			/>
		</div>
	)
}
