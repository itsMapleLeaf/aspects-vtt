import * as Lucide from "lucide-react"
import { ComponentProps, useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

export function Loading(props: ComponentProps<"div">) {
	const icons = [
		<Lucide.Flame key="icon" />,
		<Lucide.Droplet key="icon" />,
		<Lucide.Wind key="icon" />,
		<Lucide.Sun key="icon" />,
		<Lucide.Moon key="icon" />,
		<Lucide.Zap key="icon" />,
	]

	const [index, setIndex] = useState(0)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const animation = ref.current!.animate(
			[
				{ clipPath: "inset(0 0 100% 0)" },
				{ clipPath: "inset(0 0 0 0)" },
				{ clipPath: "inset(100% 0 0 0)" },
			],
			{
				duration: 800,
				delay: 50,
				easing: "ease-in-out",
				fill: "both",
			},
		)
		animation.play()
		animation.onfinish = () => {
			setIndex((index) => (index + 1) % icons.length)
			animation.play()
		}
		return () => {
			animation.cancel()
		}
	}, [icons.length])

	return (
		<div
			{...props}
			className={twMerge("text-stone-700 size-24 *:size-full", props.className)}
			ref={ref}
		>
			{icons[index]}
		</div>
	)
}
