import { defineWorkspace } from "vitest/config"

export default defineWorkspace([
	{
		extends: "./vite.config.ts",
		test: {
			name: "convex",
			include: ["convex/**/*.test.ts"],
			environment: "edge-runtime",
			server: { deps: { inline: ["convex-test"] } },
		},
	},
	{
		extends: "./vite.config.ts",
		test: {
			name: "browser",
			include: ["{src,lib}/**/*.test.{ts,tsx}"],
			environment: "happy-dom",
		},
	},
])
