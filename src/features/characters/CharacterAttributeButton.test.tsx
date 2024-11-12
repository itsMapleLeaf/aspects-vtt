import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { Id } from "~/convex/_generated/dataModel.js"
import { CharacterAttributeButton } from "./CharacterAttributeButton.tsx"

test("has tooltip", async () => {
	vi.mock("convex/react", () => ({
		useMutation: () => {},
	}))
	vi.mock("../rooms/context.tsx", () => ({
		useRoomContext: () => ({}),
	}))

	render(
		<CharacterAttributeButton
			characters={[
				{
					_id: "abc" as Id<"characters">,
					name: "test",
					attributes: {
						strength: 5,
						sense: 5,
						mobility: 5,
						intellect: 5,
						wit: 5,
					},
					race: "Renari",
					resolve: 10,
				},
			]}
			attribute={"strength"}
		/>,
	)

	await userEvent.hover(
		await screen.findByRole("button", { name: "Roll Strength" }),
	)

	await waitFor(() =>
		expect(
			screen.getByRole("tooltip", { name: "Roll Strength" }),
		).toBeVisible(),
	)
})
