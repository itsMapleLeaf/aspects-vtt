import type { ComponentProps } from "react"
import type { OptionalKeys } from "~/helpers/types.ts"
import { ModalPanel, ModalProvider } from "../../ui/Modal.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"
import type { ApiCharacter } from "./types.ts"

export interface CharacterModalProps
	extends OptionalKeys<ComponentProps<typeof ModalProvider>, "children"> {
	character: ApiCharacter
}

export function CharacterModal({ character, children, ...props }: CharacterModalProps) {
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
