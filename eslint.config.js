// @ts-check
// @ts-expect-error
import pluginJs from "@eslint/js"
import pluginReact from "eslint-plugin-react"
// @ts-expect-error
import reactCompiler from "eslint-plugin-react-compiler"
import globals from "globals"
import tseslint from "typescript-eslint"

/** @type {import("eslint").Linter.Config[]} */
export default [
	{
		ignores: [
			"**/node_modules/**",
			"build/**",
			"convex/_generated/**",
			"test-results/**",
			".turbo/**",
			".vercel/**",
			"convex-backend/**",
		],
	},

	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,

	...tseslint.configs.recommended,
	{
		rules: {
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-empty-object-type": "off",
		},
	},

	pluginReact.configs.flat?.recommended,
	pluginReact.configs.flat?.["jsx-runtime"],
	{
		settings: {
			react: {
				version: "detect",
			},
		},
	},

	{
		plugins: {
			"react-compiler": reactCompiler,
		},
		rules: {
			"react-compiler/react-compiler": "error",
		},
	},
]
