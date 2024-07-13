import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		remix({
			appDirectory: "src",
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				unstable_singleFetch: true,
				unstable_fogOfWar: true,
			},
		}),
	],
})
