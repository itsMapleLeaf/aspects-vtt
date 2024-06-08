import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { api } from "../../../convex/_generated/api"
import { useSafeAction } from "../../common/convex.ts"
import { expect } from "../../common/expect.ts"
import { Button } from "../../ui/Button.tsx"
import { Menu, MenuButton, MenuPanel } from "../../ui/Menu.tsx"
import { translucentPanel } from "../../ui/styles.ts"
import { useUser } from "../auth/UserContext.tsx"
import { diceKindsByName, getDiceKindApiInput } from "../dice/diceKinds.tsx"
import { useCharacters, useRoom } from "../rooms/roomContext.tsx"
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
					<ActionFatigueButton character={ownedCharacter} />
					<CharacterNotesButton character={ownedCharacter} />
				</div>
			</>
		:	null
}

function ActionFatigueButton({ character }: { character: OwnedCharacter }) {
	const room = useRoom()
	const createMessage = useMutation(api.messages.functions.create)
	const updateCharacter = useMutation(api.characters.functions.update)

	const [, handleClick] = useSafeAction(async () => {
		const message = await createMessage({
			roomId: room._id,
			content: `<@${character._id}>: Action Fatigue`,
			dice: [getDiceKindApiInput(expect(diceKindsByName.get("d4")), 1)],
		})
		const result = message.diceRoll?.dice[0]?.result
		if (result !== undefined) {
			await updateCharacter({
				id: character._id,
				fatigue: character.fatigue + result,
			})
		}
	})

	return (
		<Button text="Action Fatigue" icon={<Lucide.ChevronsDown />} onClick={() => handleClick()} />
	)
}

function CharacterNotesButton({ character }: { character: OwnedCharacter }) {
	return (
		<Menu placement="top">
			<MenuButton render={<Button text="Notes" icon={<Lucide.NotebookPen />} />} />
			<MenuPanel className={translucentPanel("w-[360px] p-2")} gutter={16}>
				<CharacterNotesFields character={character} />
			</MenuPanel>
		</Menu>
	)
}