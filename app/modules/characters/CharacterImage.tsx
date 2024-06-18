import { LucideGhost } from "lucide-react"
import type { ComponentProps } from "react"
import { $path } from "remix-routes"
import { UploadedImage } from "../api-images/UploadedImage.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterImage({
	character,
	...props
}: {
	character: ApiCharacter
} & ComponentProps<typeof UploadedImage>) {
	const fallbackUrl =
		character.race ?
			$path(
				"/characters/fallback/:race",
				{ race: character.race.toLowerCase() },
				{
					seed: String(
						Iterator.from(character.name).reduce(
							// modulo to ensure the number doesn't get too horrendously big on long names
							(total, char) => (total + char.charCodeAt(0)) % 1_000_000,
							0,
						),
					),
				},
			)
		:	undefined

	return (
		<UploadedImage
			id={character.imageId}
			fallbackUrl={fallbackUrl}
			fallbackIcon={<LucideGhost />}
			{...props}
		/>
	)
}
