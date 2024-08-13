import { expect, test as it } from "@playwright/test"
import { signIn, signOut } from "./auth"

it("requires auth", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByText("You must be signed in")).toBeVisible()
})

it("supports creating rooms and listing owned/joined rooms", async ({
	page,
}) => {
	await page.goto("/")
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
