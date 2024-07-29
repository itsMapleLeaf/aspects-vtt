import type { ComponentProps } from "react"
import type { OptionalKeys } from "~/helpers/types.ts"
import { Modal, ModalContent, ModalToggle } from "~/ui/Modal.v2.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"
import type { ApiCharacter } from "./types.ts"

export interface CharacterModalProps
	extends OptionalKeys<ComponentProps<typeof Modal>, "children"> {
	character: ApiCharacter
}

export function CharacterModal({ character, children, ...props }: CharacterModalProps) {
	return (
		<Modal {...props}>
			{children}
			<ModalContent className="h-full">
				<CharacterEditor character={character} />
			</ModalContent>
		</Modal>
	)
}
CharacterModal.Button = ModalToggle
