import { z } from "zod"
import { CharacterImage } from "~/modules/characters/CharacterImage.tsx"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { ResourceClass, type Resource } from "~/modules/resources/Resource"
import { Button } from "~/ui/Button.tsx"
import { ModalButton } from "~/ui/Modal.tsx"
import type { Id } from "../../../convex/_generated/dataModel"
import { CharacterModal } from "./CharacterModal.tsx"

export interface CharacterResource extends Resource {
	readonly dragData: { characterId: Id<"characters">; visible: boolean }
}

export const CharacterResource = new (class extends ResourceClass<CharacterResource> {
	readonly dragDataSchema = z.object({
		characterId: z.custom<Id<"characters">>((input) => typeof input === "string"),
		visible: z.boolean(),
	})

	create(character: ApiCharacter): CharacterResource {
		return {
			id: character._id,
			name: character.displayName,
			dragData: { characterId: character._id, visible: character.visible },
			renderTreeElement: () => (
				<CharacterModal character={character}>
					<Button
						text={character.displayName}
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
		}
	}
})()
