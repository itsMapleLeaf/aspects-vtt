import { installGlobals } from "@remix-run/node"
installGlobals({ nativeFetch: true })

import { vitePlugin as remix } from "@remix-run/dev"
import babel from "@rollup/plugin-babel"
import { vercelPreset } from "@vercel/remix/vite"
import { remixRoutes } from "remix-routes/vite.js"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import inspect from "vite-plugin-inspect"

export default defineConfig({
	plugins: [
		babel({
			babelHelpers: "bundled",
			extensions: [".ts", ".tsx"],
			include: ["app/**/*.{ts,tsx}"],
			plugins: [["@babel/plugin-proposal-decorators", { version: "2023-11" }]],
		}),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				unstable_singleFetch: true,
			},
			presets: process.env.VERCEL ? [vercelPreset()] : [],
			routes: async (defineRoutes) => {
				return defineRoutes((route) => {
					route("/", "features/rooms/RoomList.route.tsx", { index: true })
					route("/rooms/:slug", "features/rooms/RoomLayout.route.tsx", () => {
						route(undefined, "features/rooms/Room.route.tsx", { index: true })
					})
				})
			},
		}),
		remixRoutes(),
		inspect(),
		visualizer({ emitFile: true, filename: "build/stats.html" }),
	],
})
