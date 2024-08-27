// @ts-check
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
				primary: Object.fromEntries(
					Iterator.range(100, 900, 100, true).map((value) => [
						value,
						`oklch(var(--color-primary-${value}) / <alpha-value>)`,
					]),
				),
				accent: colors.cyan,
			},
		},
	},
	plugins: [
		animate,

		plugin(function theme(api) {
			api.addBase({
				":root": Object.fromEntries(
					Iterator.range(100, 900, 100, true).map((value) => {
						const t = 1 - (value - 100) / 800
						return [
							`--color-primary-${value}`,
							`${lerp(20, 98, t ** 1.8).toFixed(2)}% 8% 270`,
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
	],
}
