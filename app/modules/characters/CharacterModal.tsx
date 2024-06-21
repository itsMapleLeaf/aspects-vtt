import { createContext, use, useState, type ContextType, type ReactNode } from "react"
import type { Id } from "../../../convex/_generated/dataModel"
import { ModalPanel, ModalProvider } from "../../ui/Modal.tsx"
import { useCharacter } from "../rooms/roomContext.tsx"
import { CharacterEditor } from "./CharacterEditor.tsx"

const CharacterModalContext = createContext({
	show(characterId: Id<"characters">) {
		console.warn("Attempted to call show() outside of a CharacterModal.Provider")
	},
})

export function CharacterModal({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false)
	const [characterId, setCharacterId] = useState<Id<"characters">>()
	const character = useCharacter(characterId)

	const context: ContextType<typeof CharacterModalContext> = {
		show(characterId) {
			setOpen(true)
			setCharacterId(characterId)
		},
	}

	return (
		<CharacterModalContext value={context}>
			{children}
			<ModalProvider open={open} setOpen={setOpen}>
				<ModalPanel title="Character Profile" fullHeight>
					{character && <CharacterEditor character={character} />}
				</ModalPanel>
			</ModalProvider>
		</CharacterModalContext>
	)
}

export function useCharacterModalContext() {
	return use(CharacterModalContext)
}
