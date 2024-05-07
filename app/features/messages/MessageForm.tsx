import { useMutation, useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import { Button } from "../../ui/Button.tsx"
import { Input } from "../../ui/Input.tsx"
import { Modal, ModalButton, ModalPanel } from "../../ui/Modal.tsx"
import { Popover, PopoverPanel, PopoverTrigger } from "../../ui/Popover.tsx"
import { usePrompt } from "../../ui/Prompt.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { panel } from "../../ui/styles.ts"
import { DiceCounter } from "../dice/DiceCounter.tsx"
import { type DiceKind, diceKindsByName } from "../dice/diceKinds.tsx"
import { getDiceInputList } from "../dice/getDiceInputList.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function MessageForm() {
	const room = useRoom()
	const prompt = usePrompt()
	const createMessage = useMutation(api.messages.functions.create)

	const macros = useQuery(api.diceMacros.functions.list, { roomId: room._id })
	const createMacro = useMutation(api.diceMacros.functions.create)

	const [content, setContent] = useState("")
	const [diceCounts, setDiceCounts] = useState<Record<DiceKind["name"], number>>({})

	const totalDice = Object.values(diceCounts).reduce((sum, count) => sum + count, 0)

	return (
		<form
			action={async () => {
				try {
					await createMessage({
						roomId: room._id,
						content: content,
						dice: getDiceInputList(diceCounts).toArray(),
					})
					setContent("")
					setDiceCounts({})
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
							<DiceCounter value={diceCounts} onChange={setDiceCounts} className="col-span-2" />

							<Button
								type="button"
								icon={<Lucide.RotateCcw />}
								text="Reset dice"
								disabled={totalDice < 1}
								onClick={() => {
									setDiceCounts({})
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
										dice: getDiceInputList(diceCounts).toArray(),
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
