import test, { expect } from "@playwright/test"

test("password auth", async ({ page }) => {
	await page.goto("/")
	await page.evaluate(() => {
		window.localStorage.clear()
	})

	const username = `test_${Math.random().toString(36).slice(2)}`
	const displayName = `Test ${Math.random().toString(36).slice(2)}`
	const password = `test-${Math.random().toString(36).slice(2)}`

	// register
	await page.goto("/play")
	await page.getByRole("button", { name: "register" }).click()
	await page.getByLabel("Account handle").fill(username)
	await page.getByLabel("Display name").fill(displayName)
	await page.getByLabel("Password").fill(password)
	await page.getByRole("button", { name: "Create account" }).click()
	await expect(
		page.getByRole("button", { name: "Account actions" }),
	).toBeVisible()

	// sign out
	await page.getByRole("button", { name: "sign out" }).click()

	// sign in
	await page.goto("/play")
	await page.getByLabel("Account handle").fill(username)
	await page.getByLabel("Password").fill(password)
	await page.getByRole("button", { name: "Sign in" }).click()
	await expect(
		page.getByRole("button", { name: "Account actions" }),
	).toBeVisible()
})
