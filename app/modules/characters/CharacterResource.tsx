import { useMutation } from "convex/react"
import { LucideUserPlus2 } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { CharacterImage } from "~/modules/characters/CharacterImage.tsx"
import type { ApiCharacter } from "~/modules/characters/types.ts"
import { defineResource, type Resource } from "~/modules/resources/Resource"
import { Button } from "~/ui/Button.tsx"
import { MenuItem } from "~/ui/Menu.tsx"
import { ModalButton } from "~/ui/Modal.tsx"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { useSafeAction } from "../convex/hooks.ts"
import { useCharacter, useRoom } from "../rooms/roomContext.tsx"
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
		name: character.displayName,
		dragData: { characterId: character._id, visible: character.visible },
		TreeItemElement: () => (
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
	}),

	CreateMenuItem: (props) => (
		<NewCharacterForm {...props}>
			<MenuItem
				icon={<LucideUserPlus2 />}
				text="Character"
				hideOnClick={false}
				render={<button type="submit" />}
			/>
		</NewCharacterForm>
	),
})

interface NewCharacterFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
	afterCreate?: (id: Id<"characters">) => void
}

function NewCharacterForm({ afterCreate, children, ...props }: NewCharacterFormProps) {
	const room = useRoom()
	const createCharacter = useMutation(api.characters.functions.create)
	const [characterModalOpen, setCharacterModalOpen] = useState(false)
	const [createCharacterState, createCharacterAction] = useSafeAction(
		async (_formData: FormData) => {
			const id = await createCharacter({ roomId: room._id })
			setCharacterModalOpen(true)
			afterCreate?.(id)
			return id
		},
	)
	const createdCharacter = useCharacter(createCharacterState.value)

	return (
		<form {...props} action={createCharacterAction}>
			{children}
			{createdCharacter && (
				<CharacterModal
					character={createdCharacter}
					open={characterModalOpen}
					setOpen={setCharacterModalOpen}
				/>
			)}
		</form>
	)
}
