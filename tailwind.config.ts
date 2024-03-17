import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin.js"

export default {
	content: ["app/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: generateOklchPalette({
					hue: "var(--hue)",
					minChroma: 0.04,
					maxChroma: 0.15,
				}),
			},
			fontFamily: {
				sans: ["Manrope Variable", ...defaultTheme.fontFamily.sans],
			},
			boxShadowColor: {
				DEFAULT: `rgba(0,0,0,0.5)`,
			},
		},
	},
	plugins: [
		animate,
		plugin(function customPreflight(api) {
			api.addBase({
				":root": {
					"--hue": "280",
					// "--chroma": "35%",
				},
			})
		}),
	],
} satisfies Config

function generateOklchPalette(args: {
	hue: number | string
	minChroma: number
	maxChroma: number
}) {
	const minLightness = 0.17
	const maxLightness = 1.0
	const colors: Record<number, string> = {}
	for (let i = 1; i <= 9; i++) {
		const lightness = lerp(minLightness, maxLightness, ((i - 1) / 8) ** 1.1)
		const chroma = lerp(args.minChroma, args.maxChroma, ((i - 1) / 8) ** 1)
		colors[i * 100] = `oklch(${lightness} ${chroma} ${args.hue} / <alpha-value>)`
	}
	return colors
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}
