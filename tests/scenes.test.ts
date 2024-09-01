import { expect } from "@playwright/test"
import { api } from "../convex/_generated/api.js"
import { roomTest } from "./fixtures.ts"

roomTest.beforeEach(async ({ convex }) => {
	await convex.mutation(api.test.functions.clearScenes)
})

roomTest("scenes", async ({ page }) => {
	await page.getByRole("button", { name: "Scenes" }).click()
	await page.getByRole("button", { name: "Create scene" }).click()
	await page.getByRole("button", { name: "Create scene" }).click()

	await expect(page.getByTestId("scene-card")).toHaveCount(2)

	await page.getByTestId("scene-card").first().click()
	await page.getByRole("button", { name: "More" }).click()
	await page.getByRole("menuitem", { name: "Delete" }).click()

	await expect(page.getByTestId("scene-card")).toHaveCount(1)
})
