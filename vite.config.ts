import mdx from "@mdx-js/rollup"
import netlifyPlugin from "@netlify/vite-plugin-react-router"
import { reactRouter } from "@react-router/dev/vite"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import babel from "vite-plugin-babel"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

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
		// the react router plugin can't run under the Vite testing env at the moment
		// https://github.com/remix-run/remix/issues/8982
		process.env.NODE_ENV === "test" ? [] : reactRouter(),
		babel({
			filter: /\.[jt]sx?$/,
			include: ["src/**/*"],
			loader: "tsx",
			babelConfig: {
				presets: ["@babel/preset-typescript"],
				plugins: [["babel-plugin-react-compiler", {}]],
				sourceMaps: true,
			},
		}),
		netlifyPlugin(),
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
	server: {
		watch: {
			usePolling: true,
		},
	},
	test: {
		open: false,
		setupFiles: ["vitest.setup.ts"],
	},
})
