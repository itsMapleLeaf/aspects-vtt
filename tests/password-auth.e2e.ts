import test, { expect } from "@playwright/test"
import { ConvexHttpClient } from "convex/browser"
import { api } from "~/convex/_generated/api.js"

const username = `test_${Math.random().toString(36).slice(2)}`
const displayName = `Test ${Math.random().toString(36).slice(2)}`
const password = `test-${Math.random().toString(36).slice(2)}`

test.describe(() => {
	test.afterAll(async () => {
		const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL as string)
		await convex.mutation(api.test.functions.deleteUser, { username: username })
	})

	test("password auth", async ({ page }) => {
		await page.goto("/")
		await page.evaluate(() => {
			window.localStorage.clear()
		})

		// register
		await page.goto("/")
		await page.getByRole("button", { name: "sign up" }).click()
		await page.getByRole("dialog").getByText("sign up").click()
		await page.getByLabel("Account handle").fill(username)
		await page.getByLabel("Display name").fill(displayName)
		await page.getByLabel("Password").fill(password)
		await page.getByRole("button", { name: "Create account" }).click()

		// sign out
		await page.getByRole("button", { name: "Account actions" }).click()
		await page.getByText("sign out").click()

		// sign in
		await page.goto("/")
		await page.getByRole("button", { name: "sign in" }).click()
		await page.getByLabel("Account handle").fill(username)
		await page.getByLabel("Password").fill(password)
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "Sign in" })
			.click()
		await expect(
			page.getByRole("button", { name: "Account actions" }),
		).toBeVisible()
	})
})
