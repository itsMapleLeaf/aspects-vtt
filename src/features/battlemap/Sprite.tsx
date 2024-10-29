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

Sprite.Attachment = SpriteAttachment
function SpriteAttachment({
	children,
	side,
	className,
}: {
	children: React.ReactNode
	side: "top" | "bottom"
	className?: string
}) {
	return (
		<div
			className={twMerge(
				"absolute left-1/2 -translate-x-1/2",
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
function SpriteBadge({
	text,
	subtext,
}: {
	text: React.ReactNode
	subtext: React.ReactNode
}) {
	return (
		<div className="flex flex-col items-center whitespace-nowrap rounded border border-black bg-black/75 px-3 py-1.5 text-center font-medium backdrop-blur-sm empty:hidden">
			<p className="text-lg/5 empty:hidden">{text}</p>
			<p className="text-base/5 opacity-80 empty:hidden">{subtext}</p>
		</div>
	)
}
