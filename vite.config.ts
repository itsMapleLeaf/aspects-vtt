import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
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
		}),
	],
	ssr: {
		noExternal: ["react-use-rect", "react-use", "react-dropzone"],
	},
})

declare module "@remix-run/server-runtime" {
	interface Future {
		unstable_singleFetch: true
	}
}
