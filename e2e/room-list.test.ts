import { type Page, expect, test as it } from "@playwright/test"

it("requires auth", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByText("You must be signed in")).toBeVisible()
})

it("supports creating rooms and listing owned/joined rooms", async ({ page }) => {
	await signIn(page)
	await page.getByText("create room").click()

	// should redirect you to the room afterward
	await expect(page).toHaveURL(/\/rooms\/.*/)
	const slug = page.url().split("/").at(-1) as string

	// the room should show on the home page
	await page.goto("/")
	await expect(page.getByText(slug)).toBeVisible()

	// sign in as a new user
	await signOut(page)
	await signIn(page, { id: "testuser2" })

	// join the new room
	await page.goto(`/rooms/${slug}`)
	await expect(page.locator("[data-room-joined]")).toBeAttached()

	// the room should show on the home page
	await page.goto("/")
	await expect(page.getByText(slug)).toBeVisible()
})

async function signIn(page: Page, { id = "testuser", url = "/" } = {}) {
	await page.goto(url)
	await page.getByText("Test sign in").click()
	await page.getByRole("dialog").getByRole("textbox", { name: "User ID" }).fill(id)
	await page.getByRole("dialog").getByRole("button", { name: "Sign in" }).click()

	// wait for both tokens to be in storage
	await page.waitForFunction(() => {
		const keys = Object.keys(window.localStorage)
		return (
			keys.some((key) => key.startsWith("__convexAuthJWT")) &&
			keys.some((key) => key.startsWith("__convexAuthRefresh"))
		)
	})
}

async function signOut(page: Page) {
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
