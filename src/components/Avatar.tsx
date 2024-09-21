import * as Lucide from "lucide-react"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export interface AvatarProps extends ComponentProps<"div"> {
	src?: string | null | undefined
}

export function Avatar({ src, className, ...props }: AvatarProps) {
	return (
		<div
			{...props}
			className={twMerge(
				"aspect-square overflow-clip rounded-full border border-primary-600",
				className,
			)}
		>
			<div className="size-full bg-primary-900">
				<Lucide.VenetianMask className="size-full scale-[0.6]" aria-hidden />
			</div>
			{src && (
				<img
					src={src}
					alt=""
					className="size-full rounded-full object-cover object-top p-px"
				/>
			)}
		</div>
	)
}
