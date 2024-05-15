import type { ComponentProps, ReactNode } from "react"
import { ModalPanel, ModalPanelContent, ModalProvider } from "../../ui/Modal.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterModal({
	character,
	children,
	...props
}: { character: ApiCharacter; children: ReactNode } & ComponentProps<typeof ModalProvider>) {
	return (
		<ModalProvider {...props}>
			{children}
			<ModalPanel title="Character Profile">
				<ModalPanelContent className="p-4">
					<CharacterForm character={character} />
				</ModalPanelContent>
			</ModalPanel>
		</ModalProvider>
	)
}
