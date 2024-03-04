import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { useRef, useState } from "react"
import { HiPencilAlt } from "react-icons/hi"
import {
	HiArrowRightOnRectangle,
	HiChatBubbleOvalLeft,
	HiPaperAirplane,
	HiUser,
} from "react-icons/hi2"
import { Button } from "~/ui/Button.tsx"
import { Input } from "~/ui/Input.tsx"
import { getUsername, setUsernameResponse } from "./username.server.ts"

type Message = {
	id: string
	content: string
	error?: boolean
}

export async function loader({ request }: LoaderFunctionArgs) {
	return { username: await getUsername(request) }
}

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()

	const response = redirect(
		request.headers.get("Referer") ?? `/rooms/${params.roomId}`,
	)

	if (formData.has("clearUsername")) {
		return setUsernameResponse("", response)
	}

	const username = formData.get("username") as string
	return setUsernameResponse(username, response)
}

export default function RoomRoute() {
	const { username } = useLoaderData<typeof loader>()
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

	if (!username) {
		return (
			<main className="flex items-center flex-col h-dvh">
				<Form
					method="post"
					className="m-auto rounded-md flex flex-col items-center gap-3"
				>
					<label
						htmlFor="username"
						className="text-3xl font-light text-primary-900/75"
					>
						What should we call you?
					</label>

					<div className="flex gap-1">
						<Input
							id="username"
							name="username"
							placeholder="cute felirian"
							icon={<HiUser />}
							required
							autoFocus
							onChange={(event) => {
								const lengthLimit = 50
								if (event.currentTarget.value.length > lengthLimit) {
									event.currentTarget.setCustomValidity(
										`Your name must be less than ${lengthLimit} characters.`,
									)
								} else {
									event.currentTarget.setCustomValidity("")
								}
							}}
						/>
						<Button
							type="submit"
							text="Enter"
							icon={<HiArrowRightOnRectangle />}
						/>
					</div>
				</Form>
			</main>
		)
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
				<Form method="post">
					<Button
						type="submit"
						icon={<HiPencilAlt />}
						text={username}
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
						icon={<HiChatBubbleOvalLeft />}
						className="flex-1"
					/>
					<Button type="submit" text="Send" icon={<HiPaperAirplane />} />
				</form>
			</section>
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
