import { unwrap } from "~/helpers/errors.ts"
import { ScrollArea } from "~/ui/ScrollArea.tsx"
import { Tabs } from "~/ui/Tabs.tsx"
import { CharacterForm } from "./CharacterForm.tsx"
import { CharacterSkillsViewer } from "./CharacterSkillsViewer.tsx"
import { useCharacterUpdatePermission } from "./hooks.ts"
import type { ApiCharacter } from "./types.ts"

export function CharacterEditor({ character }: { character: ApiCharacter }) {
	const hasPermission = useCharacterUpdatePermission(character)

	const views = [
		{
			title: "Profile",
			content: (
				<ScrollArea>
					<CharacterForm character={character} />
				</ScrollArea>
			),
		},
		hasPermission && {
			title: "Skills",
			content: <CharacterSkillsViewer character={character} />,
		},
	].filter(Boolean)

	return (
		<div className="flex h-full min-h-0 flex-col">
			{views.length === 1 ?
				<div className="min-h-0 flex-1 p-2">{unwrap(views[0]).content}</div>
			:	<Tabs>
					<Tabs.List className="p-2">
						{views.map((view) => (
							<Tabs.Tab key={view.title} id={view.title}>
								{view.title}
							</Tabs.Tab>
						))}
					</Tabs.List>
					{views.map((view) => (
						<Tabs.Panel key={view.title} id={view.title} className="min-h-0 flex-1 px-2 pb-2">
							{view.content}
						</Tabs.Panel>
					))}
				</Tabs>
			}
		</div>
	)
}
