import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useState } from "react"
import { api } from "../../../convex/_generated/api.js"
import { useSafeAction } from "../../common/convex.ts"
import { Button } from "../../ui/Button.tsx"
import { FormField } from "../../ui/Form.tsx"
import { Input } from "../../ui/Input.tsx"
import { ModalButton, ModalPanel, ModalProvider } from "../../ui/Modal.tsx"
import { usePrompt } from "../../ui/Prompt.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { panel } from "../../ui/styles.ts"
import { DiceCounter } from "../dice/DiceCounter.tsx"
import { diceKindsByName, type DiceKind } from "../dice/diceKinds.tsx"
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

	const [, submit] = useSafeAction(async function submit() {
		await createMessage({
			roomId: room._id,
			content,
			dice: getDiceInputList(diceCounts).toArray(),
		})
		setContent("")
		setDiceCounts({})
	})

	async function saveMacro() {
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
	}

	const [, runMacro] = useSafeAction(async function runMacro({
		macro,
		onSuccess,
	}: {
		macro: FunctionReturnType<typeof api.diceMacros.functions.list>[0]
		onSuccess: () => void
	}) {
		await createMessage({
			roomId: room._id,
			content,
			dice: macro.dice,
		})
		onSuccess()
	})

	return (
		<form action={() => submit()} className="flex flex-col gap-2">
			<DiceCounter value={diceCounts} onChange={setDiceCounts} />

			<Button
				type="button"
				icon={<Lucide.RotateCcw />}
				text="Reset"
				disabled={totalDice < 1}
				onClick={() => {
					setDiceCounts({})
				}}
			/>

			<FormField label="Macros">
				<div className="flex gap-2 *:flex-1">
					{macros && macros.length > 0 && (
						<ModalProvider>
							{(modal) => (
								<>
									<ModalButton render={<Button icon={<Lucide.Play />} text="Run" />} />
									<ModalPanel title="Run macro" fullHeight>
										<MacroList
											macros={macros}
											onSubmit={(macro) => runMacro({ macro, onSuccess: () => modal.hide() })}
										/>
									</ModalPanel>
								</>
							)}
						</ModalProvider>
					)}
					<Button
						type="button"
						icon={<Lucide.Bookmark />}
						text="Save"
						disabled={totalDice < 1}
						onClick={saveMacro}
					/>
				</div>
			</FormField>

			<hr className="border-primary-300" />

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

function MacroList({
	macros,
	onSubmit,
}: {
	macros: FunctionReturnType<typeof api.diceMacros.functions.list>
	onSubmit: (macro: FunctionReturnType<typeof api.diceMacros.functions.list>[0]) => void
}) {
	return (
		<ScrollArea scrollbarPosition="inside" className="min-h-0 flex-1">
			<div className="grid min-h-0 gap-2 p-2">
				{macros.map((macro) => (
					<section key={macro._id} className={panel("overflow-clip")}>
						<header className="flex justify-between p-2">
							<h3 className="flex-1 self-center">{macro.name}</h3>
							<Tooltip content="Roll">
								<Button icon={<Lucide.Dices />} onClick={() => onSubmit(macro)} />
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
	)
}
