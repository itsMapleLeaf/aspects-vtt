import * as Lucide from "lucide-react"
import { ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export function DieIcon({
	faces,
	color,
	value,
	label = `d${faces}`,
	className,
}: {
	faces: number
	color?: string
	value?: ReactNode
	label?: ReactNode
	className?: string
}) {
	return (
		<div className={twMerge("w-10 cursor-default", className)}>
			<div className="relative flex aspect-square w-full items-center justify-center transition hover:brightness-125">
				<div
					data-color={color}
					className="size-full *:size-full *:fill-primary-600 *:stroke-1 data-color:saturate-50 data-[color=green]:*:fill-green-900 data-[color=red]:*:fill-red-900 data-[color=green]:*:stroke-green-200 data-[color=red]:*:stroke-red-200"
				>
					{faces === 4 ? (
						<Lucide.Pyramid />
					) : faces === 6 ? (
						<Lucide.Box />
					) : faces === 8 ? (
						<Lucide.Diamond />
					) : faces === 10 ? (
						<Lucide.Pentagon />
					) : faces === 12 ? (
						<Lucide.Hexagon />
					) : faces === 100 ? (
						<Lucide.Octagon />
					) : (
						<Lucide.Box />
					)}
				</div>
				<p
					data-color={color}
					className="absolute rounded-lg bg-primary-600 p-0.5 text-center font-bold leading-none empty:hidden data-[color=green]:bg-green-900 data-[color=red]:bg-red-900 data-color:saturate-50"
				>
					{value}
				</p>
			</div>
			<p className="text-center text-[10px] font-bold leading-3 tracking-wide">
				{label}
			</p>
		</div>
	)
}
