import mdx from "@mdx-js/rollup"
import { vitePlugin as remix } from "@remix-run/dev"
import { vercelPreset } from "@vercel/remix/vite"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import type {} from "vitest" // for vitest config types

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
		mdx({
			remarkPlugins: [remarkGfm],
			rehypePlugins: [
				rehypeSlug,
				[rehypeAutolinkHeadings, { behavior: "wrap" }],
			],
		}),
		remix({
			appDirectory: "src",
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				v3_singleFetch: true,
				v3_lazyRouteDiscovery: true,
				unstable_optimizeDeps: true,
			},
			presets: process.env.VERCEL ? [vercelPreset()] : [],
		}),
	],
	ssr: {
		noExternal: [
			"react-use-rect",
			"react-use",
			"react-dropzone",
			"@atlaskit/pragmatic-drag-and-drop",
			"@icons-pack/react-simple-icons",
		],
	},
	test: {
		setupFiles: ["vitest.setup.ts"],
	},
})

declare module "@remix-run/server-runtime" {
	interface Future {
		unstable_singleFetch: true
	}
}
