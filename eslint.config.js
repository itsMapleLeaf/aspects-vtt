// @ts-check
// @ts-expect-error
import pluginJs from "@eslint/js"
import react from "eslint-plugin-react"
// @ts-expect-error
import reactCompiler from "eslint-plugin-react-compiler"
import reactHooks from "eslint-plugin-react-hooks"
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

	react.configs.flat?.recommended,
	react.configs.flat?.["jsx-runtime"],
	{
		settings: {
			react: {
				version: "detect",
			},
		},
	},

	{
		plugins: { "react-hooks": reactHooks },
		rules: reactHooks.configs.recommended.rules,
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
