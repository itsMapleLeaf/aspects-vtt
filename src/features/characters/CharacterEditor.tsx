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
		<div className="isolate flex max-h-full min-h-0 flex-1 flex-col overflow-y-auto p-2 gap-2">
			<Tabs.Root
				selectedId={activeId}
				setSelectedId={(id) => setActiveId((current) => id ?? current)}
			>
				<div className="sticky -top-2 z-10 -m-2 shrink-0 bg-primary-800 p-2">
					<Tabs.List>
						<Tabs.Tab id="profile">Profile</Tabs.Tab>
						<Tabs.Tab id="inventory">Inventory</Tabs.Tab>
						<Tabs.Tab id="skills">Skills</Tabs.Tab>
					</Tabs.List>
				</div>

				<Tabs.Panel id="profile" unmountOnHide>
					<CharacterProfileEditor character={character} />
				</Tabs.Panel>

				<Tabs.Panel id="inventory" unmountOnHide>
					<CharacterInventoryEditor character={character} />
				</Tabs.Panel>

				<Tabs.Panel id="skills" unmountOnHide>
					<CharacterSkillsEditor character={character} />
				</Tabs.Panel>
			</Tabs.Root>
		</div>
	)
}
