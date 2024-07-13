import test, { expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
	await page.goto("/")
	await page.evaluate(() => {
		window.localStorage.clear()
	})
})

test("register link should show register form", async ({ page }) => {
	await page.goto("/play")
	await page.getByRole("button", { name: "register" }).click()
	await expect(page.getByText(/Create an account/i)).toBeVisible()
})

test("discord sign in", async ({ page }) => {
	// we only want to test that it hits the right endpoint
	let authenticated = false

	await page.route(
		/https:\/\/.*\.convex\.site\/api\/auth\/signin\/discord.*/,
		async (route, request) => {
			authenticated = true
			await route.fulfill({
				status: 303,
				headers: {
					location: request.headers().referer as string,
				},
			})
		},
	)

	await page.goto("/play")
	await page.getByRole("button", { name: "Continue with Discord" }).click()
	await page.waitForURL("/")
	expect(authenticated).toBe(true)
})
