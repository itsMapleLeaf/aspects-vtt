import containerQueries from "@tailwindcss/container-queries"
import animate from "tailwindcss-animate"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin.js"
import { theme } from "./app/theme.ts"

/** @satisfies {import("tailwindcss").Config} */
export default {
	content: ["{app,shared}/**/*.{ts,tsx}"],
	theme: {
		extend: {
			...theme,
			fontFamily: {
				sans: ["Nunito Variable", ...defaultTheme.fontFamily.sans],
			},
			boxShadowColor: {
				DEFAULT: `rgba(0,0,0,0.5)`,
			},
			dropShadow: defaultTheme.dropShadow,
		},
	},
	plugins: [
		containerQueries,
		animate,
		plugin(function customPreflight(api) {
			api.addComponents({
				".flex-center, .flex-center-col": {
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
}
