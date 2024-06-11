import { useMutation, useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Iterator } from "iterator-helpers-polyfill"
import * as Lucide from "lucide-react"
import { useState } from "react"
import TextAreaAutosize from "react-textarea-autosize"
import { api } from "../../../convex/_generated/api.js"
import { useSafeAction } from "../../common/convex.ts"
import { Button } from "../../ui/Button.tsx"
import { Panel } from "../../ui/Panel.tsx"
import { usePrompt } from "../../ui/Prompt.tsx"
import { ScrollArea } from "../../ui/ScrollArea.tsx"
import { Tooltip } from "../../ui/Tooltip.tsx"
import { panel } from "../../ui/styles.ts"
import { diceKinds, diceKindsByName, type DiceKind } from "../dice/diceKinds.tsx"
import { getDiceInputList } from "../dice/getDiceInputList.tsx"
import { useRoom } from "../rooms/roomContext.tsx"

export function MessageInput() {
	const room = useRoom()
	const prompt = usePrompt()
	const createMessage = useMutation(api.messages.functions.create)

	const macros = useQuery(api.diceMacros.functions.list, { roomId: room._id })
	const createMacro = useMutation(api.diceMacros.functions.create)

	const [content, setContent] = useState("")
	const [diceCounts, setDiceCounts] = useState<Record<DiceKind["name"], number>>({})

	const totalDice = Object.values(diceCounts).reduce((sum, count) => sum + count, 0)

	const addDie = (kind: DiceKind) =>
		setDiceCounts((counts) => ({ ...counts, [kind.name]: (counts[kind.name] ?? 0) + 1 }))

	const removeDie = (name: DiceKind["name"]) =>
		setDiceCounts((counts) => ({ ...counts, [name]: Math.max((counts[name] ?? 0) - 1, 0) }))

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
			<Panel
				className="focus-within:focus-ring cursor-text transition-colors"
				onClick={(event) => {
					event.currentTarget.querySelector("textarea")?.focus()
				}}
			>
				<TextAreaAutosize
					className="block w-full resize-none rounded bg-transparent px-3 py-2 leading-6 focus-visible:ring-0"
					aria-label="Message content"
					placeholder="Say something!"
					value={content}
					onChange={(event) => setContent(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.ctrlKey && !event.shiftKey) {
							event.preventDefault()
							submit()
						}
					}}
				/>
				<div className="flex w-fit cursor-default flex-wrap gap-1 p-1 empty:hidden">
					{diceKinds.map((kind) => {
						const count = diceCounts[kind.name] ?? 0
						return Iterator.range(count)
							.map((n) => (
								<button
									type="button"
									className="flex-center relative aspect-square size-8 p-0 opacity-100 transition-opacity hover:opacity-50"
									onClick={() => removeDie(kind.name)}
								>
									<div className="size-full">{kind.element}</div>
									<span className="sr-only">
										Remove {kind.name} #{n + 1}
									</span>
									<Lucide.X className="absolute size-3 text-white opacity-0 transition-opacity [button:hover>&]:opacity-100" />
								</button>
							))
							.toArray()
					})}
				</div>
			</Panel>

			<div className="grid auto-cols-fr grid-flow-col gap-0.5">
				{diceKinds.map((kind) => (
					<Tooltip content={kind.name} key={kind.name}>
						<button
							type="button"
							className="aspect-square p-0 opacity-75 hover:opacity-100"
							onClick={() => addDie(kind)}
						>
							{kind.element}
						</button>
					</Tooltip>
				))}
			</div>

			<div className="gap-current grid auto-cols-fr grid-flow-col">
				{/* <Button
					type="button"
					icon={<Lucide.Bookmark />}
					text="Macros"
					disabled={totalDice < 1}
					onClick={saveMacro}
				/> */}
				<Button
					type="button"
					icon={<Lucide.RotateCcw />}
					text="Reset"
					disabled={totalDice < 1}
					onClick={() => {
						setDiceCounts({})
					}}
				/>
				<Button
					type="submit"
					text="Send"
					icon={<Lucide.Send />}
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
