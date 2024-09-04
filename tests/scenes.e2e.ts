import { expect } from "@playwright/test"
import { api } from "../convex/_generated/api.js"
import { roomTest } from "./fixtures.ts"

roomTest.beforeEach(async ({ convex }) => {
	await convex.mutation(api.test.functions.clearScenes)
})

roomTest("scenes", async ({ page }) => {
	await page.getByRole("button", { name: "Scenes" }).click()

	const dialog = page.getByRole("dialog", { name: "scene" })

	await page.getByRole("button", { name: "Create scene" }).click()
	await dialog.getByLabel("Name").fill("Scene 1")
	await dialog.getByLabel("Cell size").fill("70")
	await dialog.getByRole("button", { name: "Save" }).click()

	await page.getByRole("button", { name: "Create scene" }).click()
	await dialog.getByLabel("Name").fill("Scene 2")
	await dialog.getByLabel("Cell size").fill("70")
	await dialog.getByRole("button", { name: "Save" }).click()

	await expect(page.getByTestId("scene-card")).toHaveCount(2)

	await page.getByTestId("scene-card").first().click()
	await page.getByRole("button", { name: "Delete" }).click()

	await expect(page.getByTestId("scene-card")).toHaveCount(1)
})
