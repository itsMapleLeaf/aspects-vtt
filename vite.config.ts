import mdx from "@mdx-js/rollup"
import { vitePlugin as remix } from "@remix-run/dev"
import { vercelPreset } from "@vercel/remix/vite"
import remarkGfm from "remark-gfm"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
		mdx({
			remarkPlugins: [remarkGfm],
		}),
		remix({
			appDirectory: "src",
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				unstable_singleFetch: true,
				unstable_lazyRouteDiscovery: true,
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
})

declare module "@remix-run/server-runtime" {
	interface Future {
		unstable_singleFetch: true
	}
}
