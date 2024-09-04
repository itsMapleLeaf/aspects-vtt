import { expect } from "@playwright/test"
import { api } from "../convex/_generated/api.js"
import { authTest } from "./fixtures.js"

const roomName = `test_${Math.random().toString(36).slice(8)}`

authTest("create room", async ({ page }) => {
	await page.getByRole("button", { name: "Create room" }).click()

	const dialog = page.getByRole("dialog", { name: "Create room" })
	await dialog.getByLabel("Name").fill(roomName)
	await dialog.getByLabel("Slug").fill(roomName)
	await dialog.getByRole("button", { name: "Create" }).click()

	await expect(page).toHaveURL(`/${roomName}`)
})

authTest.afterAll(async ({ convex }) => {
	await convex.mutation(api.test.functions.deleteRoom, { slug: roomName })
})
