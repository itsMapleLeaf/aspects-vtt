import { config } from "@dotenvx/dotenvx"
import { existsSync } from "node:fs"

// conditionals avoids warnings when the files are not present
if (existsSync(".env")) config({ path: ".env" })
if (existsSync(".env.local")) config({ path: ".env.local" })

import { defineConfig, devices } from "@playwright/test"
import { BASE_URL } from "./tests/constants.ts"

/** Read environment variables from file. https://github.com/motdotla/dotenv */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/** See https://playwright.dev/docs/test-configuration. */
export default defineConfig({
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "list",
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: BASE_URL,

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",

		// use headless mode only on CI
		headless: !!process.env.CI,
	},

	/* Configure projects for major browsers */
	projects: [
		// Unit tests project
		{
			name: "unit",
			testMatch: /.*\.test\.ts/,
			use: {
				// Use a dummy browser for unit tests
				browserName: "chromium",
			},
		},
		// E2E tests projects
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			testMatch: /tests\/.*\.e2e\.ts/,
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
			testMatch: /tests\/.*\.e2e\.ts/,
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
			testMatch: /tests\/.*\.e2e\.ts/,
		},
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: "bun run dev:app",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
	},
})
