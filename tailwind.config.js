// @ts-check
import animate from "tailwindcss-animate"
import colors from "tailwindcss/colors.js"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin"

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./src/**/*.{ts,tsx}", "index.html"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Nunito Variable", ...defaultTheme.fontFamily.sans],
			},
			colors: {
				base: colors.slate,
				accent: colors.teal,
			},
		},
	},
	plugins: [
		animate,
		plugin(function customStyles(api) {
			api.addComponents({
				".margin-center": {
					"@apply *:mx-auto first:*:mt-auto last:*:mb-auto": {},
				},
			})
		}),
	],
}
