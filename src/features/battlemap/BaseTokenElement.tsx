import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"
import { ApiToken } from "~/features/battlemap/types.ts"
import { ApiScene } from "~/features/scenes/types.ts"
import { Vec } from "~/shared/vec.ts"

export function BaseTokenElement({
	token,
	scene,
	...props
}: {
	token: ApiToken
	scene: ApiScene
} & ComponentProps<"div">) {
	return (
		<div
			{...props}
			className={twMerge(
				"absolute left-0 top-0 origin-top-left drop-shadow-md",
				props.className,
			)}
			style={{
				transform: `translate(${Vec.from(token.position).toCSSPixels()})`,
				...props.style,
			}}
		>
			<div
				className="relative"
				style={{ width: scene.cellSize, height: scene.cellSize }}
			>
				{props.children}
			</div>
		</div>
	)
}
