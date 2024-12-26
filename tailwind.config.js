// @ts-check
import containerQueries from "@tailwindcss/container-queries"
import typography from "@tailwindcss/typography"
import { Iterator } from "iterator-helpers-polyfill"
import animate from "tailwindcss-animate"
import colors from "tailwindcss/colors.js"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin"
import { lerp } from "./lib/math.ts"

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./src/**/*.{ts,tsx}", "index.html"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Nunito Variable", ...defaultTheme.fontFamily.sans],
			},

			colors: {
				// 100: oklch(var(--primary-100) / <alpha-value>)
				// 200: oklch(var(--primary-200) / <alpha-value>)
				// ...
				primary: Object.fromEntries(
					Iterator.range(100, 900, 100, true).map((value) => [
						value,
						`oklch(var(--primary-${value}) / <alpha-value>)`,
					]),
				),

				// 100: oklch(from var(--accent-100) l c h / <alpha-value>)
				// 200: oklch(from var(--accent-200) l c h / <alpha-value>)
				// ...
				accent: Object.fromEntries(
					Iterator.range(100, 900, 100, true).map((value) => [
						value,
						`oklch(from var(--accent-${value}) l c h / <alpha-value>)`,
					]),
				),
			},

			spacing: {
				"control-sm": defaultTheme.spacing[8],
				"control-md": defaultTheme.spacing[10],
				"control-lg": defaultTheme.spacing[12],
				"control-padding-sm": defaultTheme.spacing[3],
				"control-padding-md": defaultTheme.spacing[3.5],
				"control-padding-lg": defaultTheme.spacing[4],
				"control-icon-sm": defaultTheme.spacing[3],
				"control-icon-md": defaultTheme.spacing[4],
				"control-icon-lg": defaultTheme.spacing[5],
			},

			padding: {
				"gap": "var(--gap)",
				"gap-x": "var(--gap-x)",
				"gap-y": "var(--gap-y)",
			},

			margin: {
				"control-icon-sm": defaultTheme.spacing[0.5],
				"control-icon-md": defaultTheme.spacing[1],
				"control-icon-lg": defaultTheme.spacing[1.5],
			},
		},
	},

	plugins: [
		containerQueries,
		animate,
		typography({ target: "modern" }),

		plugin(function control(api) {
			api.addVariant("control-icon", ["& > svg", "& > [data-control-icon]"])
		}),

		plugin(function theme(api) {
			api.addBase({
				":root": {
					...Object.fromEntries(
						Iterator.range(100, 900, 100, true).map((value) => {
							const t = 1 - (value - 100) / 800
							return [
								`--primary-${value}`,
								`${lerp(20, 98, t ** 1.8).toFixed(2)}% 13% 275`,
							]
						}),
					),
					...Object.fromEntries(
						Iterator.range(100, 900, 100, true).map((value) => {
							// @ts-expect-error
							return [`--accent-${value}`, colors.cyan[value]]
						}),
					),
				},
			})
		}),

		plugin(function shortcuts(api) {
			api.addComponents({
				".margin-center": {
					"@apply *:mx-auto first:*:mt-auto last:*:mb-auto": {},
				},

				// increase specificity to allow children to also apply this
				".pointer-events-children.pointer-events-children": {
					"pointer-events": "none",
				},
				".pointer-events-children > *": {
					"pointer-events": "auto",
				},
			})
		}),

		plugin(function gap(api) {
			api.addBase({
				":root": {
					"--gap": defaultTheme.spacing[3],
					"--gap-x": "var(--gap)",
					"--gap-y": "var(--gap)",
				},
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
					"gap": (value) => ({
						"--gap": value,
						"--gap-x": "var(--gap)",
						"--gap-y": "var(--gap)",
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
			const stepCount = 10
			api.addUtilities({
				".natural-gradient": {
					"--tw-gradient-stops": [
						"var(--tw-gradient-from) 0%",
						...Iterator.range(1, stepCount).map((step) => {
							const progress = step / stepCount
							return `
								color-mix(
									in srgb,
									var(--tw-gradient-from),
									var(--tw-gradient-to) ${progress * 100}%
								)
								calc(100% * pow(${progress}, 2))
							`
						}),
						"var(--tw-gradient-to) 100%",
					].join(", "),

					// the gradient stop classes include the positions,
					// so we need to remove them in order to get the colors and mix them
					"--tw-gradient-from-position": "",
					"--tw-gradient-to-position": "",
				},
			})
		}),
	],
}
