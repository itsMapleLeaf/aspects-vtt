import * as Lucide from "lucide-react"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import "./loading.css"

export function Loading(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"wipe-down text-base-500 relative size-24 *:absolute *:inset-0 *:size-full",
				props.className,
			)}
		>
			<Lucide.Flame className="peek [animation-delay:0]" />
			<Lucide.Droplet className="peek [animation-delay:1s]" />
			<Lucide.Tornado className="peek [animation-delay:2s]" />
			<Lucide.Sun className="peek [animation-delay:3s]" />
			<Lucide.Moon className="peek [animation-delay:4s]" />
		</div>
	)
}

export function LoadingCover({ visible }: { visible: boolean }) {
	return (
		<div
			className={twMerge(
				"bg-base-900 pointer-events-none invisible fixed inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-1000",
				visible && "visible opacity-100",
			)}
		>
			<Loading className="size-24" />
		</div>
	)
}
