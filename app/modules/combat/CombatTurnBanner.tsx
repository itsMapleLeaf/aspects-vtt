import { panel } from "~/ui/styles.ts"
import { useOwnedCharacter } from "../characters/hooks.ts"
import { useRoom } from "../rooms/roomContext.tsx"

export function CombatTurnBanner() {
	const room = useRoom()
	const character = useOwnedCharacter()
	const isTurn =
		room.combat?.currentMemberId && character && room.combat.currentMemberId === character._id
	return (
		<div
			className={panel(
				"flex-center invisible fixed inset-x-0 top-20 mx-auto max-w-sm translate-y-2 p-3 text-center opacity-0 shadow-md transition-all",
				isTurn && "visible translate-y-0 opacity-100",
			)}
		>
			<h2 className="text-2xl font-light">It's your turn!</h2>
			<p>What will you do?</p>
		</div>
	)
}
