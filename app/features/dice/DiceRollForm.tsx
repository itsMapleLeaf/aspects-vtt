import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { Button } from "#app/ui/Button.tsx"
import { Input } from "#app/ui/Input.tsx"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import { useRoom } from "../rooms/roomContext.tsx"
import { type DiceKind, diceKinds } from "./diceKinds"

export function DiceRollForm() {
	const room = useRoom()
	const [label, setLabel] = useState("")
	const [diceCounts, setDiceCounts] = useState<Record<DiceKind["name"], number>>({})
	const createDiceRoll = useMutation(api.diceRolls.create)
	const totalDice = Object.values(diceCounts).reduce((sum, count) => sum + count, 0)

	const updateDiceCount = (name: string, delta: number) => {
		setDiceCounts((dice) => ({
			...dice,
			[name]: Math.max((dice[name] ?? 0) + delta, 0),
		}))
	}

	return (
		<form
			action={async () => {
				try {
					await createDiceRoll({
						roomId: room._id,
						label,
						dice: Object.entries(diceCounts).map(([name, count]) => ({ name, count })),
					})
					setDiceCounts({})
					setLabel("")
				} catch (error) {
					alert(error instanceof ConvexError ? error.message : "Something went wrong, try again.")
				}
			}}
			className="flex flex-col gap-2"
		>
			<ul className="flex flex-wrap gap-[inherit]">
				{diceKinds
					.map((kind) => ({ kind, count: diceCounts[kind.name] ?? 0 }))
					.map(({ kind, count }) => (
						<li
							key={kind.name}
							className={panel("flex items-center justify-center gap-2 px-3 py-1")}
						>
							<div className="flex flex-col">
								<button
									type="button"
									title={`Add a d${kind.name}`}
									className="-m-2 flex items-center justify-center p-2 opacity-50 transition hover:opacity-75 active:text-primary-700 active:opacity-100 active:duration-0"
									onClick={() => updateDiceCount(kind.name, 1)}
								>
									<Lucide.ChevronUp />
								</button>
								<button
									type="button"
									title={`Add a d${kind.name}`}
									className="-mx-2 flex items-center justify-center px-2 opacity-50 transition hover:opacity-75 active:text-primary-700 active:opacity-100 active:duration-0"
									onClick={() => updateDiceCount(kind.name, -1)}
								>
									<Lucide.ChevronDown />
								</button>
							</div>

							<p className="text-center text-xl font-medium tabular-nums">{count}</p>

							<button
								type="button"
								className="transition *:size-12 hover:brightness-75 active:brightness-125 active:duration-0"
								title={`Click to add a d${kind.name}, right-click to remove`}
								onClick={() => updateDiceCount(kind.name, 1)}
								onContextMenu={(event) => {
									event.preventDefault()
									updateDiceCount(kind.name, -1)
								}}
							>
								{kind.element}
							</button>
						</li>
					))}
			</ul>

			<div className="flex gap-[inherit]">
				<Input
					type="text"
					placeholder="Label"
					value={label}
					icon={<Lucide.Tag />}
					onChange={(event) => setLabel(event.target.value)}
					className="flex-1"
				/>
				<Button
					type="button"
					icon={<Lucide.X />}
					text="Clear"
					disabled={totalDice < 1}
					onClick={() => {
						setDiceCounts({})
						setLabel("")
					}}
				/>
				<Button type="submit" icon={<Lucide.Dices />} text="Roll" disabled={totalDice < 1} />
			</div>
		</form>
	)
}
