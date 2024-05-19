import { fixupConfigRules } from "@eslint/compat"
import js from "@eslint/js"
import reactCompiler from "eslint-plugin-react-compiler"
import reactHooks from "eslint-plugin-react-hooks"
import jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js"
import reactRecommended from "eslint-plugin-react/configs/recommended.js"
import globals from "globals"
import ts from "typescript-eslint"

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
	{
		ignores: ["build/", "convex/_generated/"],
	},
	{
		languageOptions: {
			ecmaVersion: "latest",
			globals: { ...globals.browser, ...globals.node },
		},
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...fixupConfigRules(reactRecommended),
	...fixupConfigRules(jsxRuntime),
	{
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			"no-console": ["error", { allow: ["warn", "info", "error"] }],
			"no-empty": ["warn", { allowEmptyCatch: true }],
			"object-shorthand": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ args: "none", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{ fixStyle: "inline-type-imports" },
			],
			"@typescript-eslint/no-import-type-side-effects": "error",
			"react/no-unescaped-entities": "off",
		},
	},
	...fixupConfigRules({
		plugins: {
			"react-hooks": reactHooks,
			"react-compiler": reactCompiler,
		},
		rules: {
			"react-hooks/exhaustive-deps": "warn",
			"react-hooks/rules-of-hooks": "error",
			"react-compiler/react-compiler": "warn",
		},
		files: ["app/**/*.{ts,tsx}"],
	}),
]
