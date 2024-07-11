// @ts-check
import animate from "tailwindcss-animate"
import defaultTheme from "tailwindcss/defaultTheme.js"

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{ts,tsx}", "index.html"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Nunito Variable", ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [animate],
}
