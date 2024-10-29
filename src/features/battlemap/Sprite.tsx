import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { Vec, VecInput } from "~/shared/vec.ts"

export type SpriteProps = ComponentProps<"div"> & {
	position?: VecInput
	size?: VecInput
	scale?: number
	pointerEvents?: boolean
}

export function Sprite({
	position = 0,
	size,
	scale = 1,
	pointerEvents = false,
	children,
	...props
}: SpriteProps) {
	return (
		<div
			{...props}
			className={twMerge(
				"absolute left-0 top-0 origin-top-left",
				pointerEvents ? "pointer-events-auto" : "pointer-events-none",
				props.className,
			)}
			style={{
				transform: `translate(${Vec.from(position).toCSSPixels()}) scale(${scale})`,
				...props.style,
			}}
		>
			<div
				className="relative"
				style={
					size != null
						? { width: Vec.from(size).x, height: Vec.from(size).y }
						: undefined
				}
			>
				{children}
			</div>
		</div>
	)
}
