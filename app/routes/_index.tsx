import { useRef, useState } from "react"

type Message = {
	id: string
	content: string
	error?: boolean
}

export default function Index() {
	const [messages, setMessages] = useState<Message[]>([])
	const formRef = useRef<HTMLFormElement>(null)

	const addMessage = (content: string) => {
		setMessages((messages) => [
			...messages,
			{ id: crypto.randomUUID(), content },
		])
	}

	const addError = (content: string) => {
		setMessages((messages) => [
			...messages,
			{ id: crypto.randomUUID(), content, error: true },
		])
	}

	const handleRollCommand = (message: string) => {
		const args = message.split(/\s+/).slice(1)
		if (args.length === 0) {
			addError("Error: No dice to roll")
			return
		}

		const results: { count: number; sides: number; rolls: number[] }[] = []
		const errors: string[] = []

		for (const arg of args) {
			const match = arg.trim().match(/^(\d+)?d(\d+)$/i)
			if (!match) {
				errors.push(`Error: Invalid dice input "${arg}"`)
				continue
			}

			const count = acceptPositiveInteger(match[1] ?? 1)
			if (!count) {
				errors.push(`Error: Invalid count "${arg}"`)
				continue
			}

			const sides = acceptPositiveInteger(match[2])
			if (!sides) {
				errors.push(`Error: Invalid sides "${arg}"`)
				continue
			}

			const rolls = [...range(count)].map(() => roll(sides))
			results.push({ count, sides, rolls })
		}

		if (errors.length > 0) {
			for (const error of errors) {
				addError(error)
			}
			return
		}

		addMessage(
			`🎲 ${results
				.map(
					(result) =>
						`${result.count}d${result.sides}: ${result.rolls.join(", ")}`,
				)
				.join(" | ")}`,
		)
		formRef.current?.reset()
	}

	return (
		<main className="h-dvh p-2 gap-2 flex flex-col bg-primary-200">
			<section className="flex-1 bg-primary-100 shadow py-2 px-3 rounded">
				{messages.map((message) => (
					<p
						key={message.id}
						data-error={message.error}
						className="text-primary-900 data-[error=true]:text-red-400"
					>
						{message.content}
					</p>
				))}
			</section>
			<form
				action={(data) => {
					const message = (data.get("message") as string).trim()
					if (message.startsWith("/roll") || message.startsWith("/r")) {
						handleRollCommand(message)
						return
					}

					if (message.startsWith("/")) {
						addError(`Error: Unknown command "${message}"`)
						return
					}

					addMessage(message)
					formRef.current?.reset()
				}}
				ref={formRef}
			>
				<input
					name="message"
					placeholder="Say something!"
					required
					className="bg-primary-100 py-2 px-3 rounded w-full outline outline-2 outline-transparent transition-[outline-color] focus:outline-primary-300"
				/>
			</form>
		</main>
	)
}

function roll(sides: number) {
	return randomInt(1, sides)
}

function randomInt(...args: [min: number, max: number] | [max: number]) {
	const [min, max] = args.length === 1 ? [1, args[0]] : args
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function* range(...args: [start: number, end: number] | [end: number]) {
	const [start, end] = args.length === 1 ? [0, args[0]] : args
	for (let i = start; i < end; i++) {
		yield i
	}
}

function acceptPositiveInteger(input: unknown) {
	const number = Number(input)
	if (Number.isInteger(number) && number > 0) {
		return number
	}
}
