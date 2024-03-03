import { vitePlugin as remix } from "@remix-run/dev"
import { installGlobals } from "@remix-run/node"
import { defineConfig } from "vite"
import inspect from "vite-plugin-inspect"
import tsconfigPaths from "vite-tsconfig-paths"

installGlobals()

export default defineConfig({
	plugins: [remix(), tsconfigPaths(), inspect()],
})
