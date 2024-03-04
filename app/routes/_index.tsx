import { useRef, useState } from "react"

export default function Index() {
	const [messages, setMessages] = useState<string[]>([])
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<main className="h-dvh p-2 gap-2 flex flex-col bg-primary-200">
			<section className="flex-1 bg-primary-100 shadow py-2 px-3 rounded">
				{messages.map((message, i) => (
					<p key={i} className="text-primary-900">
						{message}
					</p>
				))}
			</section>
			<form
				action={(data) => {
					setMessages([...messages, data.get("message") as string])
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
