import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "html",
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
	],
	webServer: [
		{
			command: "bun run dev:remix",
			url: "http://localhost:5173",
			reuseExistingServer: !process.env.CI,
			stdout: "pipe",
		},
	],
	globalSetup: "./tests/global-setup.ts",
})
