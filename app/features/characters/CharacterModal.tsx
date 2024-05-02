import type { ReactNode } from "react"
import { Modal, ModalPanel, ModalPanelContent } from "../../ui/Modal.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterModal({
	character,
	children,
}: { character: ApiCharacter; children: ReactNode }) {
	return (
		<Modal>
			{children}
			<ModalPanel title="Character Profile">
				<ModalPanelContent className="p-4">
					<CharacterForm character={character} />
				</ModalPanelContent>
			</ModalPanel>
		</Modal>
	)
}
