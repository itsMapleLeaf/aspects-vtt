import containerQueries from "@tailwindcss/container-queries"
import typography from "@tailwindcss/typography"
import { Iterator } from "iterator-helpers-polyfill"
import animate from "tailwindcss-animate"
import defaultTheme from "tailwindcss/defaultTheme.js"
import plugin from "tailwindcss/plugin.js"
import { theme } from "./app/ui/theme.ts"

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
				"sm": "0 1px 2px 0 rgb(0 0 0 / 0.25)",
				"DEFAULT": "0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)",
				"md": "0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)",
				"lg": "0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)",
				"xl": "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)",
				"2xl": "0 25px 50px -12px rgb(0 0 0 / 0.5)",
				"inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.3)",
				"none": "none",
			},
		},
	},
	corePlugins: {
		gap: false,
	},
	plugins: [
		containerQueries,
		animate,
		typography,

		plugin(function flexShortcuts(api) {
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

		plugin(function pointerEventsChildren(api) {
			api.addComponents({
				".pointer-events-children": {
					"pointerEvents": "none",
					"& > *": {
						pointerEvents: "auto",
					},
				},
			})
		}),

		plugin(function scopedGap(api) {
			api.addBase({
				":root": {
					"--gap": api.theme("gap.2", "0.5rem"),
				},
			})
			api.addUtilities({
				".gap-current": {
					gap: "var(--gap)",
				},
			})
			api.matchUtilities(
				{
					gap: (value) => ({ "gap": value, "--gap": value }),
				},
				{
					values: api.theme("gap"),
				},
			)
		}),

		plugin(function naturalGradient(api) {
			function createNaturalGradient(color, steps) {
				const stops = Iterator.range(0, steps, 1, true)
					.map((step) => {
						return color.replace("<alpha-value>", String(step / steps))
					})
					.toArray()
					.toReversed()
				return `linear-gradient(to bottom, ${stops.join(", ")})`
			}

			const entries = Object.fromEntries(
				Object.entries(theme.colors.primary).map(([key, value]) => [
					`.bg-natural-gradient-${key}`,
					{ backgroundImage: createNaturalGradient(value, 8) },
				]),
			)

			api.addUtilities(entries)
		}),
	],
}
