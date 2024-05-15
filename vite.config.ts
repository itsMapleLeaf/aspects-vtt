import mdx from "@mdx-js/rollup"
import { vitePlugin as remix } from "@remix-run/dev"
import babel from "@rollup/plugin-babel"
import { vercelPreset } from "@vercel/remix/vite"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
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
		mdx({
			rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "append" }]],
		}),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				// unstable_singleFetch: true,
			},
			presets: process.env.VERCEL ? [vercelPreset()] : [],
		}),
		remixRoutes(),
		inspect(),
		visualizer({ emitFile: true, filename: "build/stats.html" }),
	],
})
