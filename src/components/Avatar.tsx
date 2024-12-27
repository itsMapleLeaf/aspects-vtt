import * as Lucide from "lucide-react"
import { useState, type ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export interface AvatarProps extends ComponentProps<"div"> {
	src?: string | null | undefined
}

export function Avatar({ src, className, ...props }: AvatarProps) {
	const [loaded, setLoaded] = useState(false)
	return (
		<div
			{...props}
			className={twMerge(
				"border-primary-600 relative aspect-square overflow-clip rounded-full border",
				className,
			)}
		>
			<div className="bg-primary-900 absolute inset-0 size-full">
				<Lucide.VenetianMask className="size-full scale-[0.6]" aria-hidden />
			</div>
			<img
				src={src ?? undefined}
				alt=""
				className="absolute inset-0 size-full rounded-full object-cover object-top p-px opacity-0 transition duration-500 data-visible:opacity-100"
				data-visible={loaded || undefined}
				ref={(image) => {
					if (!image) return

					if (image.complete) {
						setLoaded(true)
						return
					}

					const controller = new AbortController()

					image.addEventListener("load", () => setLoaded(true), {
						signal: controller.signal,
					})
					image.addEventListener("error", () => setLoaded(false), {
						signal: controller.signal,
					})

					return () => {
						controller.abort()
					}
				}}
			/>
		</div>
	)
}
