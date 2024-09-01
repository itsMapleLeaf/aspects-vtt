import { test as base, expect, Page } from "@playwright/test"
import { ConvexHttpClient } from "convex/browser"

export const convexTest = base.extend<{
	convex: ConvexHttpClient
}>({
	convex: async ({}, use) => {
		await use(new ConvexHttpClient(process.env.VITE_CONVEX_URL as string))
	},
})

export const authTest = convexTest.extend<{ page: Page }>({
	page: async ({ page }, use) => {
		const handle = `testuser`
		const password = `testpassword`

		await page.goto("/")
		await page.getByRole("button", { name: "sign in" }).click()
		await page.getByLabel("Account handle").fill(handle)
		await page.getByLabel("Password").fill(password)
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "Sign in" })
			.click()

		await use(page)
	},
})

export const roomTest = authTest.extend<{ page: Page }>({
	page: async ({ page }, use) => {
		await page.getByText("testroom").click()
		await expect(page).toHaveURL("/testroom")
		await use(page)
	},
})
