import { json, redirect } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData, useParams } from "@remix-run/react"
import { useRef, useState } from "react"
import * as LucideIcons from "react-icons/lu"
import { roll } from "~/common/random.ts"
import { Preferences } from "~/preferences.server.ts"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"

type Message = {
	id: string
	content: string
	error?: boolean
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const preferences = await Preferences.fromRequest(request)
	preferences.update({ defaultRoomId: params.roomId as string })
	return preferences.response(
		preferences.username
			? json({ username: preferences.username })
			: redirect(`/rooms/${params.roomId}/setup`),
	)
}

export default function RoomRoute() {
	const { username } = useLoaderData<typeof loader>()
	const [messages, setMessages] = useState<Message[]>([])
	const formRef = useRef<HTMLFormElement>(null)
	const params = useParams()

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
		<main className="h-dvh p-2 gap-2 flex flex-col bg-primary-100">
			<section className="flex-1 bg-primary-200 border border-primary-300 shadow py-2 px-3 rounded">
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
			<section className="flex gap-2">
				<Button
					to={`/rooms/${params.roomId}/setup?username=${username}`}
					icon={<LucideIcons.LuPencil />}
					text={username}
					name="clearUsername"
					value="do it"
				/>
				<Form method="post" action="leave">
					<Button
						type="submit"
						icon={<LucideIcons.LuDoorOpen />}
						text="Leave"
						name="clearUsername"
						value="do it"
					/>
				</Form>
				<form
					className="contents"
					ref={formRef}
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
				>
					<Input
						name="message"
						placeholder="Say something!"
						required
						icon={<LucideIcons.LuMessageCircle />}
						className="flex-1"
					/>
					<Button type="submit" text="Send" icon={<LucideIcons.LuSend />} />
				</form>
			</section>
		</main>
	)
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
