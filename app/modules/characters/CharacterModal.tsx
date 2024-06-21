import type { ComponentProps } from "react"
import { ModalPanel, ModalProvider } from "../../ui/Modal.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterModal({
	character,
	children,
	...props
}: { character: ApiCharacter } & ComponentProps<typeof ModalProvider>) {
	return (
		<ModalProvider {...props}>
			{(store) => (
				<>
					{typeof children === "function" ? children(store) : children}
					<ModalPanel title="Character Profile" fullHeight>
						<CharacterEditor character={character} />
					</ModalPanel>
				</>
			)}
		</ModalProvider>
	)
}
