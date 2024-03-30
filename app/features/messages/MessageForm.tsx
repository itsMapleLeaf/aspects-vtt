import { useMutation } from "convex/react"
import { ConvexError } from "convex/values"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { Button } from "#app/ui/Button.tsx"
import { CheckboxField } from "#app/ui/CheckboxField.js"
import { Input } from "#app/ui/Input.tsx"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import { type DiceKind, diceKinds } from "../dice/diceKinds.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function MessageForm() {
	const room = useRoom()

	const [content, setContent] = useState("")

	const [diceCounts, setDiceCounts] = useState<Record<DiceKind["name"], number>>({})
	const totalDice = Object.values(diceCounts).reduce((sum, count) => sum + count, 0)
	const [keepDice, setKeepDice] = useState(false)

	const createMessage = useMutation(api.messages.create)

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
					await createMessage({
						roomId: room._id,
						content: content,
						dice: diceKinds
							.map((kind) => ({
								name: kind.name,
								sides: kind.faces.length,
								count: diceCounts[kind.name] ?? 0,
							}))
							.filter(({ count }) => count > 0),
					})
					setContent("")
					if (!keepDice) setDiceCounts({})
				} catch (error) {
					alert(error instanceof ConvexError ? error.message : "Something went wrong, try again.")
				}
			}}
			className="flex flex-col gap-2"
		>
			<details className="group">
				<summary className="flex cursor-default select-none items-center gap-1 transition hover:text-primary-700">
					<Lucide.ChevronRight className="cursor-default select-none transition group-open:rotate-90" />{" "}
					Dice
				</summary>

				<div className="mt-2 flex flex-col gap-2">
					<ul className="flex flex-wrap gap-2">
						{diceKinds
							.map((kind) => ({ kind, count: diceCounts[kind.name] ?? 0 }))
							.map(({ kind, count }) => (
								<li
									key={kind.name}
									data-selected={count > 0}
									className={panel(
										"flex items-center justify-center gap-2 px-3 py-1 transition *:data-[selected=false]:opacity-50",
									)}
								>
									<div className="flex flex-col">
										<button
											type="button"
											title={`Add a ${kind.name}`}
											className="-m-2 flex items-center justify-center p-2 opacity-50 transition hover:opacity-75 active:text-primary-700 active:opacity-100 active:duration-0"
											onClick={() => updateDiceCount(kind.name, 1)}
										>
											<Lucide.ChevronUp />
										</button>
										<button
											type="button"
											title={`Add a ${kind.name}`}
											className="-mx-2 flex items-center justify-center px-2 opacity-50 transition hover:opacity-75 active:text-primary-700 active:opacity-100 active:duration-0"
											onClick={() => updateDiceCount(kind.name, -1)}
										>
											<Lucide.ChevronDown />
										</button>
									</div>

									<p className="text-center text-xl font-medium tabular-nums">{count}</p>

									<button
										type="button"
										className="transition *:size-12 hover:brightness-75 active:brightness-125 active:duration-0 "
										title={`Click to add a ${kind.name}, right-click to remove`}
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

					<CheckboxField
						label="Keep dice"
						checked={keepDice}
						onChange={(event) => setKeepDice(event.target.checked)}
					/>

					<Button
						type="button"
						icon={<Lucide.RotateCcw />}
						text="Reset dice"
						disabled={totalDice < 1}
						onClick={() => {
							setDiceCounts({})
							setContent("")
						}}
					/>
				</div>
			</details>

			<div className="flex gap-[inherit]">
				<Input
					type="text"
					aria-label="Message content"
					placeholder="Say something!"
					value={content}
					onChange={(event) => setContent(event.target.value)}
					className="flex-1"
				/>
				<Button
					type="submit"
					icon={<Lucide.Send />}
					text="Send"
					disabled={totalDice < 1 && content.trim() === ""}
				/>
			</div>
		</form>
	)
}
