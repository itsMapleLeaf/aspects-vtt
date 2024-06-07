import * as Lucide from "lucide-react"
import { Button } from "../../ui/Button.tsx"
import { Menu, MenuButton, MenuPanel } from "../../ui/Menu.tsx"
import { translucentPanel } from "../../ui/styles.ts"
import { useUser } from "../auth/UserContext.tsx"
import { useCharacters } from "../rooms/roomContext.tsx"
import { AttributeDiceRollButtonGrid } from "./AttributeDiceRollButtonGrid.tsx"
import { CharacterNotesFields } from "./CharacterForm.tsx"
import { CharacterStatusFields } from "./CharacterStatusFields.tsx"
import { OwnedCharacter } from "./types.ts"

export function PlayerControlsPanel() {
	const user = useUser()
	const ownedCharacter = useCharacters()
		.filter((character) => character.playerId === user?.clerkId)
		.find(OwnedCharacter.is)
	return ownedCharacter ?
			<>
				<AttributeDiceRollButtonGrid characters={[ownedCharacter]} variant="horizontal" />
				<div className="flex items-stretch gap-2">
					<CharacterStatusFields character={ownedCharacter} />
					<div className="self-stretch border-0 border-l border-primary-300" />
					<Menu placement="top">
						<MenuButton render={<Button text="Notes" icon={<Lucide.NotebookPen />} />} />
						<MenuPanel className={translucentPanel("w-[360px] p-2")} gutter={16}>
							<CharacterNotesFields character={ownedCharacter} />
						</MenuPanel>
					</Menu>
				</div>
			</>
		:	null
}
