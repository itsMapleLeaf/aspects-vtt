import * as Lucide from "lucide-react"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import "./loading.css"

export function Loading(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"loading wipe-down relative size-24 text-base-500 *:size-full",
				props.className,
			)}
		>
			<Lucide.Flame className="loading peek absolute inset-0 size-full [animation-delay:0]" />
			<Lucide.Droplet className="loading peek absolute inset-0 size-full [animation-delay:1s]" />
			<Lucide.Tornado className="loading peek absolute inset-0 size-full [animation-delay:2s]" />
			<Lucide.Sun className="loading peek absolute inset-0 size-full [animation-delay:3s]" />
			<Lucide.Moon className="loading peek absolute inset-0 size-full [animation-delay:4s]" />
		</div>
	)
}

export function LoadingCover({ visible }: { visible: boolean }) {
	return (
		<div
			className={twMerge(
				"invisible fixed inset-0 z-10 flex items-center justify-center bg-base-900 opacity-0 transition-all duration-1000",
				visible && "visible opacity-100",
			)}
		>
			<Loading className="size-24" />
		</div>
	)
}