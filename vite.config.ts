import { vitePlugin as remix } from "@remix-run/dev"
import { vercelPreset } from "@vercel/remix/vite"
import { remixRoutes } from "remix-routes/vite.js"
import { visualizer } from "rollup-plugin-visualizer"
import { type Plugin, defineConfig } from "vite"
import inspect from "vite-plugin-inspect"

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
		visualizer({ emitFile: true, filename: "build/stats.html" }),
		stupidDumbHackyClerkFix(),
	],
})

function stupidDumbHackyClerkFix(): Plugin {
	return {
		name: "remix-globals",
		config(config, env) {
			if (env.isSsrBuild) {
				config.build ??= {}
				config.build.rollupOptions ??= {}
				const output = [(config.build.rollupOptions.output ??= [])].flat()
				output.push({
					banner: `import { installGlobals } from "@remix-run/node";installGlobals();`,
				})

				config.ssr ??= {}
				if (Array.isArray(config.ssr.noExternal)) {
					config.ssr.noExternal.push("@clerk")
				} else {
					config.ssr.noExternal = ["@clerk"]
				}
			}
		},
	}
}
