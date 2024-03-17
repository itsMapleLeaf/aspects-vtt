import { vitePlugin as remix } from "@remix-run/dev"
import { installGlobals } from "@remix-run/node"
import { vercelPreset } from "@vercel/remix/vite"
import { remixRoutes } from "remix-routes/vite.js"
import { defineConfig } from "vite"
import inspect from "vite-plugin-inspect"

installGlobals()

export default defineConfig({
	plugins: [
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
			presets: [process.env.VERCEL && vercelPreset()].filter(Boolean),
		}),
		remixRoutes(),
		inspect(),
	],
})
