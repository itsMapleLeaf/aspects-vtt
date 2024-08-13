import type { ComponentProps } from "react"
import { getCharacterFallbackImageUrl } from "~/modules/characters/helpers.ts"
import { withMergedClassName } from "~/ui/withMergedClassName.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterImage({
	character,
	...props
}: {
	character: ApiCharacter
} & ComponentProps<"div">) {
	const fallbackUrl = getCharacterFallbackImageUrl(character)
	return (
		<div
			{...withMergedClassName(
				props,
				"bg-cover bg-top will-change-transform w-full",
			)}
			style={{
				backgroundImage: `url(${character.imageUrl ?? fallbackUrl})`,
				...props.style,
			}}
		/>
	)
}
