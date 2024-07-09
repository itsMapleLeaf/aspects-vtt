import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "e2e",
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
			name: "setup",
			testMatch: "global-setup.ts",
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup"],
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			dependencies: ["setup"],
		},
	],
	webServer: [
		{
			command: "bun run convex-backend start",
			port: 3210,
			reuseExistingServer: !process.env.CI,
			stdout: "pipe",
		},
		{
			command: "bun run dev-convex-backend",
			url: "http://localhost:5173",
			reuseExistingServer: !process.env.CI,
			stdout: "pipe",
		},
	],
})
