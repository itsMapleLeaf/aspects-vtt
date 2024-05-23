import { fixupConfigRules } from "@eslint/compat"
import reactCompiler from "eslint-plugin-react-compiler"
import reactHooks from "eslint-plugin-react-hooks"
import jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js"
import reactRecommended from "eslint-plugin-react/configs/recommended.js"
import globals from "globals"
import ts from "typescript-eslint"

export default ts.config(
	{
		ignores: ["build/", "convex/_generated/"],
	},

	// recommended configs are too noisy
	// js.configs.recommended,
	// ...ts.configs.recommended,
	// ...ts.configs.stylistic,

	{
		plugins: {
			"@typescript-eslint": ts.plugin,
		},
		languageOptions: {
			ecmaVersion: "latest",
			globals: { ...globals.browser, ...globals.node },
			parser: ts.parser,
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"no-console": ["error", { allow: ["warn", "info", "error"] }],
			"object-shorthand": "warn",
			"prefer-const": "warn",

			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
			"@typescript-eslint/no-import-type-side-effects": "error",
			"@typescript-eslint/no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_" }],
		},
	},

	{
		settings: {
			react: {
				version: "detect",
			},
		},
	},
	...fixupConfigRules(reactRecommended),
	...fixupConfigRules(jsxRuntime),
	...fixupConfigRules({
		files: ["app/**/*.{ts,tsx}"],
		plugins: {
			"react-hooks": reactHooks,
			"react-compiler": reactCompiler,
		},
		rules: {
			"react/no-unescaped-entities": "off",
			"react-hooks/exhaustive-deps": "warn",
			"react-hooks/rules-of-hooks": "error",
			"react-compiler/react-compiler": "warn",
		},
	}),
)
