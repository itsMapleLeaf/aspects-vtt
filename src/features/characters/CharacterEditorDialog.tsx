import { ComponentProps, useRef } from "react"
import * as v from "valibot"
import { useLocalStorage } from "~/common/react/dom.ts"
import { Dialog } from "~/components/Dialog.tsx"
import { Tabs } from "~/components/Tabs.tsx"
import type { NormalizedCharacter } from "~/convex/characters.ts"
import { CharacterInventoryEditor } from "./CharacterInventoryEditor.tsx"
import {
	type ProfileEditorRef,
	CharacterProfileEditor,
} from "./CharacterProfileEditor.tsx"

export { Button as CharacterEditorDialogButton } from "~/components/Dialog.tsx"

export function CharacterEditorDialog({
	children,
	character,
	...props
}: ComponentProps<typeof Dialog.Root> & {
	character: NormalizedCharacter
}) {
	const profileEditorRef = useRef<ProfileEditorRef>(null)

	const [activeId, setActiveId] = useLocalStorage(
		"characterEditorDialog:activeId",
		"profile",
		v.parser(v.string()),
	)

	return (
		<Dialog.Root {...props}>
			{children}

			<Dialog.Content
				title="Edit Character"
				className="h-[800px]"
				onClose={() => {
					// profileEditorRef.current?.submit()
				}}
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
							<CharacterProfileEditor
								character={character}
								ref={profileEditorRef}
							/>
						</Tabs.Panel>

						<Tabs.Panel id="inventory" className="-mx-3 -mb-3 min-h-0 flex-1">
							<CharacterInventoryEditor character={character} />
						</Tabs.Panel>

						<Tabs.Panel
							id="skills"
							className="-mx-3 -mb-3 min-h-0 flex-1 overflow-y-auto p-3"
						>
							<CharacterSkillsEditor />
						</Tabs.Panel>
					</Tabs.Root>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	)
}

function CharacterSkillsEditor() {
	return <p>skills</p>
}
