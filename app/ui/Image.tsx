import { LucideImageOff } from "lucide-react"
import type { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export interface ImageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
	src?: string
	fallbackIcon?: ReactNode
	className?: string | { container?: string; image?: string; icon?: string }
}

export function Image({ src, fallbackIcon = <LucideImageOff />, className, ...props }: ImageProps) {
	const resolvedClassName = typeof className === "string" ? { container: className } : className
	return (
		<div {...props} className={twMerge("flex-center size-full", resolvedClassName?.container)}>
			{src ?
				<img
					src={src}
					alt=""
					className={twMerge(
						// will-change-transform keeps the image from looking super grainy with certain other classes
						"size-full object-contain will-change-transform",
						resolvedClassName?.image,
					)}
					draggable={false}
				/>
			:	<div
					className={twMerge(
						"flex-center aspect-square w-3/4 min-w-[min(4rem,100%)] max-w-32 text-primary-600 opacity-50 *:size-full empty:hidden",
						resolvedClassName?.icon,
					)}
				>
					{fallbackIcon}
				</div>
			}
		</div>
	)
}
