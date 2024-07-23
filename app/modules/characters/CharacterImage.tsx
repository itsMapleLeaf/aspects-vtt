import type { ComponentProps } from "react"
import type { Nullish, StrictOmit } from "~/helpers/types.ts"
import { getCharacterFallbackImageUrl } from "~/modules/characters/helpers.ts"
import type { Id } from "../../../convex/_generated/dataModel"
import { ApiImage } from "../api-images/ApiImage.tsx"

export function CharacterImage({
	character,
	...props
}: {
	character: {
		_id: Id<"characters">
		image?: Nullish<Id<"images">>
		race?: Nullish<string>
	}
} & StrictOmit<ComponentProps<typeof ApiImage>, "imageId">) {
	const fallbackUrl = getCharacterFallbackImageUrl(character)
	return (
		<ApiImage
			imageId={character.image}
			fallback={
				<img src={fallbackUrl} alt="" className="object-cover object-top will-change-transform" />
			}
			{...props}
		/>
	)
}
