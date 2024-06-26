import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { Tabs } from "~/ui/Tabs.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import { CharacterSkillsViewer } from "./CharacterSkillsViewer.tsx"
import { useCharacterUpdatePermission } from "./hooks.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterEditor({ character }: { character: ApiCharacter }) {
	const hasPermission = useCharacterUpdatePermission(character)
	return (
		<div className="flex h-full min-h-0 flex-col">
			{hasPermission ?
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
			:	<div className="min-h-0 flex-1 p-2">
					<ScrollArea>
						<CharacterForm character={character} />
					</ScrollArea>
				</div>
			}
		</div>
	)
}
