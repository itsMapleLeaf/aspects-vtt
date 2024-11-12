import { ComponentProps } from "react"
import { Avatar } from "~/components/Avatar.tsx"
import { getImageUrl } from "~/features/images/getImageUrl.ts"
import { ApiCharacter } from "./types.ts"

export function CharacterAvatar({
	character,
	...props
}: ComponentProps<typeof Avatar> & { character: ApiCharacter }) {
	return (
		<Avatar
			src={character.imageId && getImageUrl(character.imageId)}
			{...props}
		/>
	)
}
