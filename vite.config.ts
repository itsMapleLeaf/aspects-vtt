import mdx from "@mdx-js/rollup"
import { vitePlugin as remix } from "@remix-run/dev"
import { vercelPreset } from "@vercel/remix/vite"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { flatRoutes } from "remix-flat-routes"
import { remixRoutes } from "remix-routes/vite.js"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"
import inspect from "vite-plugin-inspect"

export default defineConfig({
	plugins: [
		babel({
			filter: /\.tsx?$/,
			babelConfig: {
				presets: ["@babel/preset-typescript"],
				plugins: ["babel-plugin-react-compiler"],
				sourceMaps: true,
			},
		}),
		mdx({
			remarkPlugins: [remarkGfm],
			rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "append" }]],
		}),
		remix({
			routes: async (defineRoutes) => flatRoutes("routes", defineRoutes),
			ignoredRouteFiles: ["**/*"],
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
