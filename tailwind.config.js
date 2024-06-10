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
			boxShadow: {
				sm: "0 1px 2px 0 rgb(0 0 0 / 0.25)",
				DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)",
				md: "0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)",
				lg: "0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)",
				xl: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)",
				"2xl": "0 25px 50px -12px rgb(0 0 0 / 0.5)",
				inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.3)",
				none: "none",
			},
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
				".pointer-events-children": {
					pointerEvents: "none",
					"& > *": {
						pointerEvents: "auto",
					},
				},
			})
		}),
	],
}
