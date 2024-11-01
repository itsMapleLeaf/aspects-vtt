// @ts-check
// @ts-expect-error
import pluginJs from "@eslint/js"
import react from "eslint-plugin-react"
// @ts-expect-error
import reactCompiler from "eslint-plugin-react-compiler"
// @ts-expect-error
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
	// global file config
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

	// node.js environment
	{
		files: ["./*"],
		languageOptions: {
			globals: { ...globals.node },
		},
	},

	// browser environment
	{
		files: ["./src/**"],
		languageOptions: {
			globals: { ...globals.node },
		},
	},

	// agnostic/edge environment
	{
		files: ["./convex/**", "./shared/**"],
		languageOptions: {},
	},

	// javascript
	pluginJs.configs.recommended,
	{
		rules: {
			"object-shorthand": "warn",
		},
	},

	// typescript
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

	// react
	/** @type {import("typescript-eslint").ConfigWithExtends} */ (
		react.configs.flat?.recommended
	),
	/** @type {import("typescript-eslint").ConfigWithExtends} */ (
		react.configs.flat?.["jsx-runtime"]
	),
	{
		settings: {
			react: {
				version: "detect",
			},
		},
	},

	// react-hooks
	{
		plugins: { "react-hooks": reactHooks },
		rules: reactHooks.configs.recommended.rules,
	},

	// react-compiler
	{
		plugins: {
			"react-compiler": reactCompiler,
		},
		rules: {
			"react-compiler/react-compiler": "error",
		},
	},
)
