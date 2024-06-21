import { $path } from "remix-routes"
import { z } from "zod"
import { CharacterImage } from "~/modules/characters/CharacterImage.tsx"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { ResourceClass, type Resource } from "~/modules/resources/Resource"
import type { Id } from "../../../convex/_generated/dataModel"

export interface CharacterResource extends Resource {
	readonly dragData: { characterId: Id<"characters">; visible: boolean }
}

export const CharacterResource = new (class extends ResourceClass<CharacterResource> {
	readonly dragDataSchema = z.object({
		characterId: z.custom<Id<"characters">>((input) => typeof input === "string"),
		visible: z.boolean(),
	})

	create(character: ApiCharacter, roomSlug: string): CharacterResource {
		return {
			id: character._id,
			name: character.displayName,
			dragData: { characterId: character._id, visible: character.visible },
			action: {
				type: "link",
				location: $path(
					"/rooms/:slug/:view?",
					{ slug: roomSlug, view: "character" },
					{ id: character._id },
				),
			},
			renderIcon: () => (
				<CharacterImage
					character={character}
					className={{ image: "rounded-full object-cover object-top" }}
				/>
			),
		}
	}
})()
