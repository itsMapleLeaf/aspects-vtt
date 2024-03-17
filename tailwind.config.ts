import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin.js"
import { theme } from "#app/theme.js"

export default {
	content: ["app/**/*.{ts,tsx}"],
	theme: {
		extend: {
			...theme,
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
