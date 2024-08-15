import { expect, test } from "bun:test"
import { getByRole, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
	Prompt,
	type PromptComponentProps,
	PromptProvider,
	usePrompt,
} from "./prompt.tsx"

test.skip("prompt", async () => {
	render(
		<PromptProvider>
			<Prompt />
			<TestPrompter />
		</PromptProvider>,
	)

	const expected = crypto.randomUUID()
	let result: string

	function TestPrompter() {
		const prompt = usePrompt()
		return (
			<button
				type="button"
				onClick={async () => {
					result = await prompt.show(TestModal, { title: "Test Dialog" })
				}}
			>
				Test
			</button>
		)
	}

	function TestModal({
		title,
		resolve,
	}: { title: string } & PromptComponentProps<string>) {
		return (
			<dialog open>
				<h1>{title}</h1>
				<button type="button" onClick={() => resolve(expected)}>
					Confirm
				</button>
			</dialog>
		)
	}

	await userEvent.click(screen.getByRole("button", { name: "Test" }))
	await userEvent.click(
		getByRole(screen.getByRole("dialog", { name: "Test Dialog" }), "button", {
			name: "Confirm",
		}),
	)
	await waitFor(() => expect(result).toBe(expected))
})
