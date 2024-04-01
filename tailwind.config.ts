import containerQueries from "@tailwindcss/container-queries"
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
				sans: ["Nunito Variable", ...defaultTheme.fontFamily.sans],
			},
			boxShadowColor: {
				DEFAULT: `rgba(0,0,0,0.5)`,
			},
		},
	},
	plugins: [
		containerQueries,
		animate,
		plugin(function customPreflight(api) {
			api.addComponents({
				".flex-center-col": {
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
				},
				".flex-center-row": {
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
				},
			})
		}),
	],
} satisfies Config
