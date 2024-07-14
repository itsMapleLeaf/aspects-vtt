import { expect, test as it, type Page } from "@playwright/test"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api.js"
import type { Branded } from "../convex/helpers/convex.js"
import { ConvexTestDb } from "./helpers/convex.js"

async function login(page: Page) {
	await page.goto("/")
	await page.getByText("Sign in").first().click()
	await page.getByLabel("Email").fill("testuser")
	await page.getByLabel("Email").press("Enter")
	await page.getByRole("textbox", { name: "Password" }).fill("testpass")
	await page.getByRole("textbox", { name: "Password" }).press("Enter")
}

it("should be protected by auth", async ({ page }) => {
	await page.goto("/")
	await expect(page.getByText("You must be signed in")).toBeVisible()
})

it.describe(() => {
	it("should support creating rooms and redirect you to the room", async ({ page }) => {
		await login(page)

		await page.goto("/")
		await page.getByText("create room").click()

		// should redirect you to the room afterward
		await expect(page).toHaveURL(/\/rooms\/.*/)
		const slug = page.url().split("/").at(-1) as string

		// go home before deleting the room, otherwise the app breaks (maybe write a test for that?)
		await page.goto("/")

		// this is just nice optional cleanup; a couple of extra rooms is no problem, and we don't want to fail the test on this
		try {
			const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL as string)
			await convex.mutation(api.testing.removeRoom, { slug })
		} catch (error) {
			console.warn("Failed to remove room", error)
		}
	})
})

it.fixme("should show created and joined rooms in the rooms list", async ({ page }) => {
	await using db = new ConvexTestDb()

	const slug1 = `room-${Math.random()}`
	const room1 = await db.insert("rooms", {
		slug: slug1,
		name: slug1,
		// @ts-expect-error
		ownerId: "user_2Z9fHkCpkPkBG63fyQmaGHydinS" as Branded<"clerkId">,
	})

	const slug2 = `room-${Math.random()}`
	const room2 = await db.insert("rooms", {
		slug: slug2,
		name: slug2,
		// @ts-expect-error
		ownerId: "random" as Branded<"clerkId">,
	})

	await db.insert("players", {
		// @ts-expect-error
		userId: "user_2Z9fHkCpkPkBG63fyQmaGHydinS" as Branded<"clerkId">,
		roomId: room1._id,
	})
	await db.insert("players", {
		// @ts-expect-error
		userId: "user_2Z9fHkCpkPkBG63fyQmaGHydinS" as Branded<"clerkId">,
		roomId: room2._id,
	})

	await login(page)
	await page.goto("/")
	await expect(page.getByText(room1.name!)).toBeVisible()
	await expect(page.getByText(room2.name!)).toBeVisible()
})
