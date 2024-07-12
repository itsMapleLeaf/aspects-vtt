import * as Lucide from "lucide-react"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import "./loading.css"

export function Loading(props: ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"text-stone-700 size-24 *:size-full wipe-down relative",
				props.className,
			)}
		>
			<Lucide.Flame className="first-icon absolute inset-0 size-full" />
			<Lucide.Droplet className="second-icon absolute inset-0 size-full" />
			<Lucide.Tornado className="third-icon absolute inset-0 size-full" />
			<Lucide.Sun className="fourth-icon absolute inset-0 size-full" />
			<Lucide.Moon className="fifth-icon absolute inset-0 size-full" />
		</div>
	)
}
