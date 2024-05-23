import type { ComponentProps, ReactNode } from "react"
import { ModalPanel, ModalProvider } from "../../ui/Modal.tsx"
import { Tabs } from "../../ui/Tabs.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import { CharacterSkillsViewer } from "./CharacterSkillsViewer.tsx"
import type { ApiCharacter } from "./types.ts"

export function CharacterModal({
	character,
	children,
	...props
}: { character: ApiCharacter; children: ReactNode } & ComponentProps<typeof ModalProvider>) {
	return (
		<ModalProvider {...props}>
			{children}
			<ModalPanel title="Character Profile" fullHeight>
				<div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
					{character.isOwner ?
						<Tabs>
							<Tabs.List>
								<Tabs.Tab>Profile</Tabs.Tab>
								<Tabs.Tab>Skills</Tabs.Tab>
							</Tabs.List>
							<Tabs.Panel className="min-h-0 flex-1 overflow-y-auto">
								<CharacterForm character={character} />
							</Tabs.Panel>
							<Tabs.Panel className="flex min-h-0 flex-1 flex-col">
								<CharacterSkillsViewer character={character} />
							</Tabs.Panel>
						</Tabs>
					:	<CharacterForm character={character} />}
				</div>
			</ModalPanel>
		</ModalProvider>
	)
}
