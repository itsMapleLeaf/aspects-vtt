import { Page } from "@playwright/test"

const handle = `testuser`
const password = `testpassword`

export async function testLogin(page: Page) {
	await page.goto("/")
	await page.getByRole("button", { name: "sign in" }).click()
	await page.getByLabel("Account handle").fill(handle)
	await page.getByLabel("Password").fill(password)
	await page
		.getByRole("dialog")
		.getByRole("button", { name: "Sign in" })
		.click()
}
