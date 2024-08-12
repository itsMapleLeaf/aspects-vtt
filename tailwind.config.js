// @ts-check
import daisyui from "daisyui"
import themes from "daisyui/src/theming/themes.js"
import animate from "tailwindcss-animate"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin"

/** @type {import("tailwindcss").Config} */
export default {
	content: ["./src/**/*.{ts,tsx}", "index.html"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Nunito Variable", ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [
		daisyui,
		animate,
		plugin(function customStyles(api) {
			api.addComponents({
				".margin-center": {
					"@apply *:mx-auto first:*:mt-auto last:*:mb-auto": {},
				},
			})
		}),
	],
	daisyui: {
		themes: [
			{
				dark: {
					...themes.dim,
					"--rounded-box": "0.5rem", // border radius rounded-box utility class, used in card and other large boxes
					"--rounded-btn": "0.5rem", // border radius rounded-btn utility class, used in buttons and similar element
					// "--rounded-badge": "1.9rem", // border radius rounded-badge utility class, used in badges and similar
					// "--animation-btn": "0.25s", // duration of animation when you click on button
					// "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
					// "--btn-focus-scale": "0.95", // scale transform of button when you focus on it
					// "--border-btn": "1px", // border width of buttons
					// "--tab-border": "1px", // border width of tabs
					// "--tab-radius": "0.5rem", // border radius of tabs
				},
			},
		],
	},
}
