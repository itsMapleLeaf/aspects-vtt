// @ts-check
import containerQueries from "@tailwindcss/container-queries"
import { Iterator } from "iterator-helpers-polyfill"
import animate from "tailwindcss-animate"
import colors from "tailwindcss/colors.js"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin"
import { lerp } from "./src/common/math.ts"

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./src/**/*.{ts,tsx}", "index.html"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Nunito Variable", ...defaultTheme.fontFamily.sans],
			},
			colors: {
				primary: Object.fromEntries(
					Iterator.range(100, 900, 100, true).map((value) => [
						value,
						`oklch(var(--color-primary-${value}) / <alpha-value>)`,
					]),
				),
				accent: colors.cyan,
			},
		},
		screens: {
			sm: "var(--screens-sm)",
			md: "var(--screens-md)",
			lg: "var(--screens-lg)",
			xl: "var(--screens-xl)",
		},
		boxShadow: {
			DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.25)",
			none: "none",
		},
	},
	corePlugins: {
		gap: false,
	},
	plugins: [
		containerQueries,
		animate,

		plugin(function screenVariables(api) {
			api.addBase({
				":root": {
					"--screens-sm": "768px",
					"--screens-md": "1024px",
					"--screens-lg": "1280px",
					"--screens-xl": "1536px",
				},
			})
		}),

		plugin(function theme(api) {
			api.addBase({
				":root": Object.fromEntries(
					Iterator.range(100, 900, 100, true).map((value) => {
						const t = 1 - (value - 100) / 800
						return [
							`--color-primary-${value}`,
							`${lerp(20, 98, t ** 1.8).toFixed(2)}% 13% 275`,
						]
					}),
				),
			})
		}),

		plugin(function shortcuts(api) {
			api.addComponents({
				".margin-center": {
					"@apply *:mx-auto first:*:mt-auto last:*:mb-auto": {},
				},
			})
		}),

		plugin(function gap(api) {
			api.addBase({
				"--gap-x": api.theme("spacing.3"),
				"--gap-y": api.theme("spacing.3"),
			})

			api.addUtilities({
				".gap": {
					"column-gap": "var(--gap-x)",
					"row-gap": "var(--gap-y)",
				},
				".gap-x": {
					"column-gap": "var(--gap-x)",
				},
				".gap-y": {
					"row-gap": "var(--gap-y)",
				},
			})

			api.matchUtilities(
				{
					gap: (value) => ({
						"--gap-x": value,
						"--gap-y": value,
						"column-gap": value,
						"row-gap": value,
					}),
					"gap-x": (value) => ({
						"--gap-x": value,
						"column-gap": value,
					}),
					"gap-y": (value) => ({
						"--gap-y": value,
						"row-gap": value,
					}),
				},
				{
					values: api.theme("gap"),
				},
			)
		}),

		plugin(function naturalGradient(api) {
			api.addUtilities({
				".natural-gradient": {
					"--tw-gradient-stops": [
						"var(--tw-gradient-from)",
						"color-mix(in oklch, var(--tw-gradient-from), var(--tw-gradient-to) 20%) calc(100% * pow(0.2,2))",
						"color-mix(in oklch, var(--tw-gradient-from), var(--tw-gradient-to) 40%) calc(100% * pow(0.4,2))",
						"color-mix(in oklch, var(--tw-gradient-from), var(--tw-gradient-to) 60%) calc(100% * pow(0.6,2))",
						"color-mix(in oklch, var(--tw-gradient-from), var(--tw-gradient-to) 80%) calc(100% * pow(0.8,2))",
						"var(--tw-gradient-to)",
					].join(", "),
				},
			})
		}),
	],
}
