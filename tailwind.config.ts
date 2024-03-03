import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin.js"

export default {
	content: ["app/**/*.{ts,tsx}"],
	theme: {
		colors: {
			primary: generateOklchPalette({
				hue: "var(--hue)",
				minChroma: 0.08,
				maxChroma: 0.35,
			}),
		},
	},
	plugins: [
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
	const minLightness = 0.1
	const maxLightness = 1
	const colors: Record<number, string> = {}
	for (let i = 1; i <= 9; i++) {
		const lightness = lerp(minLightness, maxLightness, ((i - 1) / 8) ** 1)
		const chroma = lerp(args.minChroma, args.maxChroma, ((i - 1) / 8) ** 1.4)
		colors[i * 100] = `oklch(${lightness} ${chroma} ${args.hue})`
	}
	return colors
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}
