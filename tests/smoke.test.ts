import { expect, test } from "@playwright/test"
import { site } from "~/modules/meta/helpers.ts"

test("smoke", async ({ page }) => {
	await page.goto("/")
	await expect(page).toHaveTitle(site.title)
})
