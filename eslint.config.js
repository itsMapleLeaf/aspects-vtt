// @ts-check
import { fixupConfigRules } from "@eslint/compat"
// @ts-expect-error
import js from "@eslint/js"
// @ts-expect-error
import reactCompiler from "eslint-plugin-react-compiler"
// @ts-expect-error
import reactHooks from "eslint-plugin-react-hooks"
// @ts-expect-error
import jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js"
// @ts-expect-error
import reactRecommended from "eslint-plugin-react/configs/recommended.js"
import globals from "globals"
import ts from "typescript-eslint"

export default ts.config(
	{
		ignores: ["build/", "convex/_generated/"],
	},

	js.configs.recommended,
	...ts.configs.recommended,
	...ts.configs.stylistic,

	{
		languageOptions: {
			ecmaVersion: "latest",
			globals: { ...globals.browser, ...globals.node },
			parser: ts.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"no-console": ["error", { allow: ["warn", "info", "error"] }],
			"object-shorthand": "warn",
			"prefer-const": "warn",
			"no-useless-rename": "warn",

			"@typescript-eslint/array-type": ["warn", { default: "array-simple" }],
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/consistent-type-imports": ["warn", { fixStyle: "inline-type-imports" }],
			"@typescript-eslint/no-import-type-side-effects": "error",
			"@typescript-eslint/no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_" }],
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/ban-types": "off",
			"@typescript-eslint/restrict-template-expressions": "error",
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
			"react/no-unknown-property": "off",
			"react/prop-types": "off",
			"react/jsx-no-undef": "off",

			"react-hooks/exhaustive-deps": "warn",
			"react-hooks/rules-of-hooks": "error",

			"react-compiler/react-compiler": "warn",
		},
	}),
)
