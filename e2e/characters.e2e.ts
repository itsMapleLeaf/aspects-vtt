import test, { expect } from "@playwright/test"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api.js"
import { signIn } from "./auth.js"

let room: {
	slug: string
	name: string
}

test.beforeAll(async () => {
	const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL as string)
	room = await convex.mutation(api.testing.createTestRoom)
})

test.beforeEach(async ({ page }) => {
	await page.goto(`/rooms/${room.slug}`)
	await signIn(page)
})

test("character name visibility", async ({ page }) => {
	await page.getByRole("button", { name: "All Characters" }).click()

	await expect(
		page
			.getByTestId("CharacterResourceTreeItem")
			.filter({ hasText: "Visible Character" }),
	).toBeVisible()
	await expect(
		page.getByTestId("CharacterResourceTreeItem").filter({ hasText: "???" }),
	).toHaveCount(1)

	await expect(
		page
			.getByTestId("CombatMemberItem:Name")
			.filter({ hasText: "Visible Character" }),
	).toBeVisible()
	await expect(
		page.getByTestId("CombatMemberItem:Name").filter({ hasText: "???" }),
	).toHaveCount(2)
})
