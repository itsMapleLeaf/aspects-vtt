import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [remix({ appDirectory: "src" })],
})
