/** @type {import("prettier").Config} */
export default {
	semi: false,
	useTabs: true,
	experimentalTernaries: true,
	quoteProps: "consistent",
	plugins: ["prettier-plugin-jsdoc", "prettier-plugin-tailwindcss"],
	tailwindFunctions: ["twMerge", "mergeClassNameProp"],
	overrides: [
		{
			files: ["convex/_generated/**", "pnpm-lock.yaml", "convex.json"],
			options: {
				requirePragma: true,
			},
		},
	],
}
