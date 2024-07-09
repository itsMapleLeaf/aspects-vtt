import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test as it, type Page } from "@playwright/test"

async function login(page: Page) {
	await setupClerkTestingToken({ page })
	await page.goto("/")
	await page.getByText("Sign in").first().click()
	await page.getByLabel("Email").fill("testuser")
	await page.getByLabel("Email").press("Enter")
	await page.getByRole("textbox", { name: "Password" }).fill("testpass")
	await page.getByRole("textbox", { name: "Password" }).press("Enter")
}

// it.beforeEach(async ({ page }) => {
// await page.request.post("/test/room-list/reset")
// })

it("should be protected by auth", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByText("You must be signed in")).toBeVisible()
})

it("should support creating rooms and redirect you to the room", async ({ page }) => {
	await login(page)

	await page.goto("/")
	await page.getByText("create room").click()

	// should redirect you to the room afterward
	await expect(page).toHaveURL(/\/rooms\/.*/)
})

it.fixme("should show rooms in the rooms list", async ({ page }) => {
	await page.request.post("/test/room-list/seed")
	await login(page)
})
