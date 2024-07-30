/** @type {import("prettier").Config} */
export default {
	semi: false,
	useTabs: true,
	printWidth: 100,
	experimentalTernaries: true,
	quoteProps: "consistent",
	plugins: ["prettier-plugin-jsdoc", "prettier-plugin-tailwindcss"],
	tailwindFunctions: ["twMerge", "mergeClassNameProp"],
	overrides: [
		{
			files: ["convex/_generated/**"],
			options: {
				requirePragma: true,
			},
		},
	],
}
