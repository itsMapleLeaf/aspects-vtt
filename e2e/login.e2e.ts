import test from "@playwright/test"

test("login", async ({ page }) => {
	await page.route(
		/https:\/\/.+?convex\.site\/api\/auth\/signin\/discord.*/,
		async (route) => {
			await route.fulfill({
				status: 302,
				headers: {
					Location: "http://localhost:5173/",
				},
			})
		},
	)

	await page.goto("/")
	await page.getByText("Sign in with Discord").click()
})
