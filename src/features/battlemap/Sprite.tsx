import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { Vec, VecInput } from "~/lib/vec"

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
				"absolute top-0 left-0 origin-top-left will-change-[transform,opacity]",
				pointerEvents ? "pointer-events-auto" : "pointer-events-none",
				props.className,
			)}
			style={{
				transform: `translate(${Vec.from(position).roundTo(1).toCSSPixels()}) scale(${scale})`,
				...props.style,
			}}
		>
			<div
				className="relative"
				style={
					size != null
						? {
								width: Math.floor(Vec.from(size).x),
								height: Math.floor(Vec.from(size).y),
							}
						: undefined
				}
			>
				{children}
			</div>
		</div>
	)
}

Sprite.Attachment = SpriteAttachment
function SpriteAttachment({
	children,
	side,
	className,
	...props
}: {
	children: React.ReactNode
	side: "top" | "bottom"
	className?: string
} & ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"absolute left-1/2 flex -translate-x-1/2 flex-col gap-2",
				side === "top" && "bottom-full",
				side === "bottom" && "top-full",
				className,
			)}
		>
			{children}
		</div>
	)
}

Sprite.Badge = SpriteBadge
function SpriteBadge(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"flex flex-col items-center rounded-xs border border-black bg-black/75 px-3 py-1 text-center font-medium whitespace-nowrap backdrop-blur-xs empty:hidden",
				props.className,
			)}
		/>
	)
}

Sprite.Meter = SpriteMeter
function SpriteMeter({
	value,
	max,
	className,
}: {
	value: number
	max: number
	className?: { root?: string; fill?: string }
}) {
	return (
		<div
			className={twMerge(
				"bg-opacity-50 flex h-4 gap-0.5 rounded-xs border border-blue-700 bg-blue-400 backdrop-blur-xs will-change-transform",
				className?.root,
			)}
			style={{ width: `${max * 16}px` }}
		>
			<div
				className={twMerge(
					"size-full origin-left rounded-[inherit] bg-blue-400",
					className?.fill,
				)}
				style={{ scale: `${value / max} 1` }}
			></div>
		</div>
	)
}
