import * as Lucide from "lucide-react"
import { Button } from "../../ui/Button.tsx"
import { Menu, MenuButton, MenuPanel } from "../../ui/Menu.tsx"
import { translucentPanel } from "../../ui/styles.ts"
import { CharacterNotesFields } from "../characters/CharacterForm.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacter } from "../characters/hooks.ts"
import type { ApiCharacter } from "../characters/types.ts"

export function PlayerControlsPanel() {
	const ownedCharacter = useOwnedCharacter()
	return ownedCharacter ?
			<div className="flex gap-2">
				<div className="contents *:w-[20rem]">
					<CharacterStatusFields character={ownedCharacter} />
				</div>
				<div className="w-px bg-primary-300" />
				<CharacterNotesButton character={ownedCharacter} />
			</div>
		:	null
}

function CharacterNotesButton({ character }: { character: ApiCharacter }) {
	return (
		<Menu placement="top">
			<MenuButton render={<Button text="Notes" icon={<Lucide.NotebookPen />} />} />
			<MenuPanel className={translucentPanel("w-[360px] p-2")} gutter={16}>
				<CharacterNotesFields character={character} />
			</MenuPanel>
		</Menu>
	)
}
