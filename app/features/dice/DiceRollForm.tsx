import { useMutation } from "convex/react"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { range } from "#app/common/range.ts"
import { Button } from "#app/ui/Button.tsx"
import { Input } from "#app/ui/Input.tsx"
import { api } from "#convex/_generated/api.js"
import type { Id } from "#convex/_generated/dataModel.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { diceKinds } from "./diceKinds"

export function DiceRollForm({ userId }: { userId: Id<"users"> }) {
	const room = useRoom()
	const [label, setLabel] = useState("")
	const [dice, setDice] = useState<Record<number, number>>({})
	const createDiceRoll = useMutation(api.diceRolls.create)
	const totalDice = Object.values(dice).reduce((sum, count) => sum + count, 0)

	return (
		<form
			action={async () => {
				await createDiceRoll({
					roomId: room._id,
					rolledBy: userId,
					label,
					dice: Object.entries(dice).flatMap(([sides, count]) =>
						[...range(count)].map(() => ({ sides: Number(sides) })),
					),
				})
				setDice({})
				setLabel("")
			}}
			className="flex flex-col gap-2"
		>
			<div className="flex flex-wrap gap-[inherit]">
				{diceKinds.map((kind) => (
					<div key={kind.sides} className="relative flex justify-center">
						<Button
							icon={kind.icon}
							text={(dice[kind.sides] ?? 0) === 0 ? `d${kind.sides}` : `${dice[kind.sides]}`}
							data-faded={(dice[kind.sides] ?? 0) === 0}
							className="tabular-nums data-[faded=true]:opacity-60"
							onClick={() =>
								setDice((dice) => ({
									...dice,
									[kind.sides]: (dice[kind.sides] ?? 0) + 1,
								}))
							}
							onContextMenu={(event: React.MouseEvent) => {
								event.preventDefault()
								setDice((dice) => ({
									...dice,
									[kind.sides]: Math.max((dice[kind.sides] ?? 0) - 1, 0),
								}))
							}}
						/>
					</div>
				))}
			</div>
			<div className="flex gap-[inherit]">
				<Input
					type="text"
					placeholder="Label"
					value={label}
					icon={<Lucide.Tag />}
					onChange={(event) => setLabel(event.target.value)}
					className="flex-1"
				/>
				<Button type="submit" text="Roll" icon={<Lucide.Dices />} disabled={totalDice < 1} />
			</div>
		</form>
	)
}
