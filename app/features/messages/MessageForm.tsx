import { useMutation, useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { Button } from "#app/ui/Button.tsx"
import { Input } from "#app/ui/Input.tsx"
import { Modal, ModalButton, ModalPanel } from "#app/ui/Modal.js"
import { Popover, PopoverPanel, PopoverTrigger } from "#app/ui/Popover.js"
import { usePrompt } from "#app/ui/Prompt.js"
import { ScrollArea } from "#app/ui/ScrollArea.js"
import { Tooltip } from "#app/ui/Tooltip.js"
import { panel } from "#app/ui/styles.js"
import { api } from "#convex/_generated/api.js"
import {
	type DiceKind,
	diceKinds,
	diceKindsByName,
	getDiceKindApiInput,
} from "../dice/diceKinds.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function MessageForm() {
	const room = useRoom()
	const prompt = usePrompt()
	const createMessage = useMutation(api.messages.create)

	const macros = useQuery(api.diceMacros.list, { roomId: room._id })
	const createMacro = useMutation(api.diceMacros.create)

	const [content, setContent] = useState("")
	const [diceCounts, setDiceCounts] = useState<Record<DiceKind["name"], number>>({})

	const totalDice = Object.values(diceCounts).reduce((sum, count) => sum + count, 0)

	function updateDiceCount(name: string, delta: number) {
		setDiceCounts((dice) => ({
			...dice,
			[name]: Math.max((dice[name] ?? 0) + delta, 0),
		}))
	}

	function getDiceInput() {
		return Iterator.from(diceKinds)
			.map((kind) => getDiceKindApiInput(kind, diceCounts[kind.name] ?? 0))
			.filter(({ count }) => count > 0)
	}

	return (
		<form
			action={async () => {
				try {
					await createMessage({
						roomId: room._id,
						content: content,
						dice: getDiceInput().toArray(),
					})
					setContent("")
				} catch (error) {
					alert(error instanceof ConvexError ? error.message : "Something went wrong, try again.")
				}
			}}
			className="flex flex-col gap-2"
		>
			<div className="flex gap-[inherit]">
				<Popover placement="left-start">
					<PopoverTrigger render={<Button icon={<Lucide.Dices />} title="Dice" />} />
					<PopoverPanel gutter={16} shift={-8}>
						<div className="grid grid-cols-2 gap-2 p-2">
							<ul className="contents">
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
												className="transition *:size-12 hover:brightness-75 active:brightness-125 active:duration-0"
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

							<Button
								type="button"
								icon={<Lucide.Bookmark />}
								text="Save macro"
								disabled={totalDice < 1}
								onClick={async () => {
									const name = await prompt({
										title: "Save dice macro",
										inputLabel: "Name",
										inputPlaceholder: "Do the cool awesome thing",
										buttonText: "Save",
										buttonIcon: <Lucide.Save />,
									})
									if (!name) return

									await createMacro({
										name,
										roomId: room._id,
										dice: getDiceInput().toArray(),
									})
								}}
							/>
						</div>
					</PopoverPanel>
				</Popover>
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

			{macros && macros.length > 0 && (
				<Modal>
					{(modal) => (
						<>
							<ModalButton render={<Button icon={<Lucide.Bookmark />} text="Saved macros" />} />
							<ModalPanel title="Saved macros" fullHeight>
								<ScrollArea scrollbarPosition="inside" className="min-h-0 flex-1">
									<div className="grid min-h-0 gap-2 p-2">
										{macros.map((macro) => (
											<section key={macro._id} className={panel("overflow-clip")}>
												<header className="flex justify-between p-2">
													<h3 className="flex-1 self-center">{macro.name}</h3>
													<Tooltip content="Roll">
														<Button
															icon={<Lucide.Dices />}
															onClick={async () => {
																try {
																	await createMessage({
																		roomId: room._id,
																		content: content,
																		dice: macro.dice,
																	})
																	setContent("")
																	modal.hide()
																} catch (error) {
																	alert(
																		error instanceof ConvexError
																			? error.message
																			: "Something went wrong, try again.",
																	)
																}
															}}
														/>
													</Tooltip>
												</header>
												<ul className="flex flex-wrap gap-2 border-t border-primary-300 bg-black/25 p-2">
													{macro.dice.map((die) =>
														Iterator.range(die.count)
															.map((n) => (
																<li key={n} className="*:size-12 empty:hidden">
																	{diceKindsByName.get(die.name)?.element}
																</li>
															))
															.toArray(),
													)}
												</ul>
											</section>
										))}
									</div>
								</ScrollArea>
							</ModalPanel>
						</>
					)}
				</Modal>
			)}
		</form>
	)
}

function Collapse({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
	return (
		<details className="group">
			<summary className="flex cursor-default select-none items-center gap-1 py-1 transition hover:text-primary-700">
				<Lucide.ChevronRight className="cursor-default select-none transition group-open:rotate-90" />
				{title}
			</summary>
			<div className="mt-2">{children}</div>
		</details>
	)
}
