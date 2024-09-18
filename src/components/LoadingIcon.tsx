import * as Lucide from "lucide-react"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import "./LoadingIcon.css"

export function LoadingIcon(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"wipe-down text-base-500 relative size-6 *:absolute *:inset-0 *:size-full",
				props.className,
			)}
		>
			<Lucide.Flame className="peek [animation-delay:0]" />
			<Lucide.Droplet className="peek [animation-delay:1s]" />
			<Lucide.Wind className="peek [animation-delay:2s]" />
			<Lucide.Sun className="peek [animation-delay:3s]" />
			<Lucide.Moon className="peek [animation-delay:4s]" />
		</div>
	)
}
