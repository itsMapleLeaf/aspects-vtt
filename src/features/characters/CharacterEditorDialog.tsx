import { useQuery } from "convex/react"
import { ComponentProps, useState } from "react"
import * as v from "valibot"
import { useLocalStorage } from "~/common/react/dom.ts"
import { Dialog } from "~/components/Dialog.tsx"
import { Tabs } from "~/components/Tabs.tsx"
import { api } from "~/convex/_generated/api.js"
import { Id } from "~/convex/_generated/dataModel.js"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { useRoomContext } from "~/features/rooms/context.tsx"
import { CharacterInventoryEditor } from "./CharacterInventoryEditor.tsx"
import { CharacterProfileEditor } from "./CharacterProfileEditor.tsx"
import { CharacterSkillsEditor } from "./CharacterSkillsEditor.tsx"

export { Button as CharacterEditorDialogButton } from "~/components/Dialog.tsx"

export function CharacterEditorDialog({
	children,
	character,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	character: NormalizedCharacter
}) {
	const [activeId, setActiveId] = useLocalStorage(
		`characterEditorDialog:activeId:${character._id}`,
		"profile",
		v.parser(v.string()),
	)

	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title={character.name}
				description="Edit character details"
				className="h-[1000px] max-w-xl"
			>
				<div className="flex h-full min-h-0 flex-col gap-2">
					<Tabs.Root
						selectedId={activeId}
						setSelectedId={(id) => setActiveId((current) => id ?? current)}
					>
						<Tabs.List>
							<Tabs.Tab id="profile">Profile</Tabs.Tab>
							<Tabs.Tab id="inventory">Inventory</Tabs.Tab>
							<Tabs.Tab id="skills">Skills</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel
							id="profile"
							className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
						>
							<CharacterProfileEditor character={character} />
						</Tabs.Panel>

						<Tabs.Panel id="inventory" className="-mx-3 -mb-3 min-h-0 flex-1">
							<CharacterInventoryEditor character={character} />
						</Tabs.Panel>

						<Tabs.Panel
							id="skills"
							className="-m-3 min-h-0 flex-1 overflow-y-auto"
						>
							<CharacterSkillsEditor character={character} />
						</Tabs.Panel>
					</Tabs.Root>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	)
}

export function useCharacterEditorDialog() {
	const room = useRoomContext()
	const characters = useQuery(api.characters.list, { roomId: room._id })

	const [editorOpen, setEditorOpen] = useState(false)
	const [editingCharacterId, setEditingCharacterId] =
		useState<Id<"characters">>()
	const editingCharacter = characters?.find(
		(it) => it._id === editingCharacterId,
	)

	const show = (characterId: Id<"characters">) => {
		setEditingCharacterId(characterId)
		setEditorOpen(true)
	}

	const hide = () => {
		setEditorOpen(false)
	}

	const element = editingCharacter?.full && (
		<CharacterEditorDialog
			character={editingCharacter.full}
			open={editorOpen}
			setOpen={setEditorOpen}
		/>
	)

	return { show, hide, element }
}
