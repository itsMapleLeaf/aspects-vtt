import { z } from "zod"
import { CharacterImage } from "~/modules/characters/CharacterImage.tsx"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { defineResource, type Resource } from "~/modules/resources/Resource"
import { Button } from "~/ui/Button.tsx"
import { ModalButton } from "~/ui/Modal.tsx"
import type { Id } from "../../../convex/_generated/dataModel"
import { CharacterModal } from "./CharacterModal.tsx"

export interface CharacterResource extends Resource {
	readonly dragData: { characterId: Id<"characters">; visible: boolean }
}

export const CharacterResource = defineResource({
	name: "CharacterResource",

	dragDataSchema: z.object({
		characterId: z.custom<Id<"characters">>((input) => typeof input === "string"),
		visible: z.boolean(),
	}),

	create: (character: ApiCharacter) => ({
		id: character._id,
		name: character.name ?? "???",
		dragData: { characterId: character._id, visible: character.visible ?? false },
	}),

	TreeItem: ({ character }: { character: ApiCharacter }) => (
		<CharacterModal character={character}>
			<Button
				text={character.name ?? "???"}
				icon={
					<CharacterImage
						character={character}
						className={{ image: "rounded-full object-cover object-top" }}
					/>
				}
				appearance="clear"
				className="w-full justify-start"
				element={<ModalButton />}
			/>
		</CharacterModal>
	),
})
