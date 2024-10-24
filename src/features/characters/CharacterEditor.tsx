import * as v from "valibot"
import { useLocalStorage } from "~/common/react/dom.ts"
import { Tabs } from "~/components/Tabs.tsx"
import { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterInventoryEditor } from "~/features/characters/CharacterInventoryEditor.tsx"
import { CharacterProfileEditor } from "~/features/characters/CharacterProfileEditor.tsx"
import { CharacterSkillsEditor } from "~/features/characters/CharacterSkillsEditor.tsx"

export function CharacterEditor({
	character,
}: {
	character: NormalizedCharacter
}) {
	const [activeId, setActiveId] = useLocalStorage(
		`characterEditorDialog:activeId:${character._id}`,
		"profile",
		v.parser(v.string()),
	)

	return (
		<div className="flex max-h-full flex-col gap-2">
			<Tabs.Root
				selectedId={activeId}
				setSelectedId={(id) => setActiveId((current) => id ?? current)}
			>
				<Tabs.List className="shrink-0">
					<Tabs.Tab id="profile">Profile</Tabs.Tab>
					<Tabs.Tab id="inventory">Inventory</Tabs.Tab>
					<Tabs.Tab id="skills">Skills</Tabs.Tab>
				</Tabs.List>

				<div className="min-h-0 flex-1 overflow-y-auto">
					<Tabs.Panel id="profile">
						<CharacterProfileEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="inventory">
						<CharacterInventoryEditor character={character} />
					</Tabs.Panel>

					<Tabs.Panel id="skills">
						<CharacterSkillsEditor character={character} />
					</Tabs.Panel>
				</div>
			</Tabs.Root>
		</div>
	)
}
