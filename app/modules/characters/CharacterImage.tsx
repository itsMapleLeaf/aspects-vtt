import { LucideGhost } from "lucide-react"
import type { ComponentProps } from "react"
import type { StrictOmit } from "~/helpers/types.ts"
import { UploadedImage } from "../api-images/UploadedImage.tsx"
import { getCharacterFallbackImageUrl } from "./helpers.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterImage({
	character,
	...props
}: {
	character: ApiCharacter
} & StrictOmit<ComponentProps<typeof UploadedImage>, "imageId">) {
	return (
		<UploadedImage
			imageId={character.imageId}
			fallbackUrl={getCharacterFallbackImageUrl(character)}
			fallbackIcon={<LucideGhost />}
			{...props}
		/>
	)
}
