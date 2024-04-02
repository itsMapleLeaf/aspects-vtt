import { vitePlugin as remix } from "@remix-run/dev"
import { flatRoutes } from "remix-flat-routes"
import { remixRoutes } from "remix-routes/vite.js"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import inspect from "vite-plugin-inspect"

export default defineConfig({
	plugins: [
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
			// presets: [process.env.VERCEL && vercelPreset()].filter(Boolean),
			routes: async (defineRoutes) => flatRoutes("routes", defineRoutes),
		}),
		remixRoutes(),
		inspect(),
		visualizer({ emitFile: true, filename: "build/stats.html" }),
	],
})
