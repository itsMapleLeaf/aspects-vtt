import { type Page, expect } from "@playwright/test"

export async function signIn(page: Page, { id = "testuser", url = "/" } = {}) {
	await page.getByText("Test sign in").click()
	await page
		.getByRole("dialog")
		.getByRole("textbox", { name: "User ID" })
		.fill(id)
	await page
		.getByRole("dialog")
		.getByRole("button", { name: "Sign in" })
		.click()

	// wait for both tokens to be in storage
	await page.waitForFunction(() => {
		const keys = Object.keys(window.localStorage)
		return (
			keys.some((key) => key.startsWith("__convexAuthJWT")) &&
			keys.some((key) => key.startsWith("__convexAuthRefresh"))
		)
	})
}

export async function signOut(page: Page) {
	await page.getByRole("button", { name: "Account actions" }).click()
	await page.getByRole("menuitem", { name: "Sign out" }).click()
	await expect(page.getByText("You must be signed in")).toBeVisible()

	// wait for both tokens to not be in localStorage
	await page.waitForFunction(() => {
		const keys = Object.keys(window.localStorage)
		return (
			keys.every((key) => !key.startsWith("__convexAuthJWT")) &&
			keys.every((key) => !key.startsWith("__convexAuthRefresh"))
		)
	})
}
