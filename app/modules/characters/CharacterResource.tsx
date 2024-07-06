import { LucideEyeOff } from "lucide-react"
import { z } from "zod"
import { CharacterImage } from "~/modules/characters/CharacterImage.tsx"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { defineResource, type Resource } from "~/modules/resources/Resource"
import { Button } from "~/ui/Button.tsx"
import { ModalButton } from "~/ui/Modal.tsx"
import type { Id } from "../../../convex/_generated/dataModel"
import { useUser } from "../auth/hooks.ts"
import { CharacterModal } from "./CharacterModal.tsx"
import { useCharacterUpdatePermission } from "./hooks.ts"

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
		<CharacterResourceTreeItem character={character} />
	),
})

function CharacterResourceTreeItem({ character }: { character: ApiCharacter }) {
	const user = useUser()
	const hasPermission = useCharacterUpdatePermission(character)
	return (
		<CharacterModal character={character}>
			<Button
				icon={
					<CharacterImage
						character={character}
						className={{ image: "rounded-full object-cover object-top" }}
					/>
				}
				appearance="clear"
				className="w-full"
				align="start"
				element={<ModalButton />}
				active={user?.clerkId === character.playerId}
			>
				<div className="flex min-w-0 flex-1 items-center gap-1">
					<div className="min-w-0 shrink-0 truncate">
						{character.nameVisible ? character.name : <em className="inline-block pr-1">???</em>}
					</div>
					{hasPermission && !character.nameVisible && (
						<div className="min-w-0 truncate opacity-75">({character.name})</div>
					)}
					{character.visible ? null : (
						<LucideEyeOff className="ml-auto size-5 shrink-0 opacity-50" />
					)}
				</div>
			</Button>
		</CharacterModal>
	)
}
