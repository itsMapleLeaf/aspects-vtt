import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await setupClerkTestingToken({ page })
	await page.goto("/")
	await page.getByText("sign in").first().click()
	await page.getByLabel("Email").fill("testuser")
	await page.getByLabel("Email").press("Enter")
	await page.getByRole("textbox", { name: "Password" }).fill("testpass")
	await page.getByRole("textbox", { name: "Password" }).press("Enter")
})

test.describe("rooms", () => {
	test("creating rooms", async ({ page }) => {
		await page.getByText("create room").click()

		// should redirect you to the room afterward
		await page.waitForURL("**/rooms/*")

		// TODO: should show in the rooms list
		// const slug = page.url().split("/").at(-1) as string
		// await page.goto("/")
		// await expect(page.getByText(slug)).toBeVisible()
	})
})
