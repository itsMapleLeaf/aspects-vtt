import { config } from "@dotenvx/dotenvx"
import { defineConfig, devices } from "@playwright/test"
config()

export default defineConfig({
	outputDir: "data/test-results",
	testDir: "e2e",
	testMatch: ["e2e/**/*.e2e.*"],
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { outputFolder: "data/playwright-report" }]],
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
			command: "pnpm run build && pnpm run preview",
			url: "http://localhost:5173",
			reuseExistingServer: !process.env.CI,
			stdout: "pipe",
			env: {
				PORT: "5173",
				NODE_ENV: "test",
			},
		},
	],
})
