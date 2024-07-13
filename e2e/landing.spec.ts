import { expect, test } from "@playwright/test"

test("landing goes to /play", async ({ page }) => {
	await page.goto("/")
	await page.getByRole("link", { name: "Play now" }).click()
	await expect(page).toHaveURL("/play")
})
