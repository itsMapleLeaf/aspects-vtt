import { twMerge } from "tailwind-merge"
import { ApiToken } from "~/features/battlemap/types.ts"
import { ApiScene } from "~/features/scenes/types.ts"
import { Sprite, SpriteProps } from "./Sprite.tsx"

export function BaseTokenElement({
	token,
	scene,
	...props
}: SpriteProps & {
	token: ApiToken
	scene: ApiScene
}) {
	return (
		<Sprite
			position={token.position}
			size={token.size ?? scene.cellSize}
			pointerEvents
			{...props}
			className={twMerge("touch-none", props.className)}
			data-token-id={token._id}
		/>
	)
}
