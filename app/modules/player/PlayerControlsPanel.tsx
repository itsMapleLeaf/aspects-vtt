import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { api } from "../../../convex/_generated/api"
import { unwrap } from "../../helpers/errors.ts"
import { Button } from "../../ui/Button.tsx"
import { Menu, MenuButton, MenuPanel } from "../../ui/Menu.tsx"
import { translucentPanel } from "../../ui/styles.ts"
import { CharacterNotesFields } from "../characters/CharacterForm.tsx"
import { CharacterStatusFields } from "../characters/CharacterStatusFields.tsx"
import { useOwnedCharacter } from "../characters/helpers.ts"
import type { OwnedCharacter } from "../characters/types.ts"
import { useSafeAction } from "../convex/helpers.ts"
import { diceKindsByName, getDiceKindApiInput } from "../dice/data.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function PlayerControlsPanel() {
	const ownedCharacter = useOwnedCharacter()
	return ownedCharacter ?
			<div className="flex gap-2">
				<div className="contents *:w-[20rem]">
					<CharacterStatusFields character={ownedCharacter} />
				</div>
				<div className="w-px bg-primary-300" />
				<ActionFatigueButton character={ownedCharacter} />
				<CharacterNotesButton character={ownedCharacter} />
			</div>
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
			dice: [getDiceKindApiInput(unwrap(diceKindsByName.get("d4")), 1)],
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
