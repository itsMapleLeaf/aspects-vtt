import { createContext, use, useState, type ContextType, type ReactNode } from "react"
import type { Id } from "../../../convex/_generated/dataModel"
import { ModalPanel, ModalProvider } from "../../ui/Modal.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { useCharacters } from "../rooms/roomContext.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import { CharacterSkillsViewer } from "./CharacterSkillsViewer.tsx"

const CharacterModalContext = createContext({
	show(characterId: Id<"characters">) {
		console.warn("Attempted to call show() outside of a CharacterModal.Provider")
	},
})

export function CharacterModal({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false)
	const [characterId, setCharacterId] = useState<Id<"characters"> | null>(null)
	const character = useCharacters().find((it) => it._id === characterId)

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
					{character && (
						<div className="flex min-h-0 flex-1 flex-col">
							{character.isOwner ?
								<Tabs>
									<Tabs.List className="p-2">
										<Tabs.Tab>Profile</Tabs.Tab>
										<Tabs.Tab>Skills</Tabs.Tab>
									</Tabs.List>
									<Tabs.Panel className="min-h-0 flex-1 px-2 pb-2">
										<ScrollArea>
											<CharacterForm character={character} />
										</ScrollArea>
									</Tabs.Panel>
									<Tabs.Panel className="min-h-0 flex-1 px-2 pb-2">
										<CharacterSkillsViewer character={character} />
									</Tabs.Panel>
								</Tabs>
							:	<CharacterForm character={character} />}
						</div>
					)}
				</ModalPanel>
			</ModalProvider>
		</CharacterModalContext>
	)
}

export function useCharacterModalContext() {
	return use(CharacterModalContext)
}
