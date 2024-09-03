import { NavLink, useNavigation } from "@remix-run/react"
import { LucideImageOff } from "lucide-react"
import { panel } from "./styles.js"
import { ReactNode } from "react"
import { To } from "@remix-run/router"
import { twMerge } from "tailwind-merge"

export function Card({
	image,
	fallbackIcon = <LucideImageOff />,
	caption,
	to,
	onClick,
	className,
}: {
	image?: ReactNode
	fallbackIcon?: ReactNode
	caption?: ReactNode
	to?: To
	onClick?: () => void
	className?: string
}) {
	const navigation = useNavigation()
	const CaptionComponent = to || onClick ? "h2" : "figcaption"

	const content = (
		<>
			<div className="relative grid aspect-video bg-primary-800">
				<div className="size-16 place-self-center stroke-1 opacity-50 *:size-full">
					{fallbackIcon}
				</div>
				<div className="absolute inset-0 *:size-full">{image}</div>
			</div>
			<CaptionComponent className="text-balance py-1.5 text-center text-xl font-light">
				{caption}
			</CaptionComponent>
		</>
	)

	const wrapperClass = twMerge(
		panel(),
		"shadow-lg overflow-clip transition-transform hover:scale-105",
		className,
	)

	return (
		to ?
			<NavLink
				to={to}
				prefetch="intent"
				onClick={onClick}
				className={({ isPending }) =>
					twMerge(wrapperClass, isPending && "animate-pulse")
				}
			>
				{content}
			</NavLink>
		: onClick ?
			<button onClick={onClick} className={wrapperClass}>
				{content}
			</button>
		:	<figure className={wrapperClass}>{content}</figure>
	)
}
