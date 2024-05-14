import { dark } from "@clerk/themes"
import { theme, toHex } from "./theme.ts"

export const clerkConfig = {
	telemetry: false,
	appearance: {
		baseTheme: dark,
		variables: {
			borderRadius: "0.25rem",
			// clerk doesn't accept oklch() :(
			colorBackground: toHex(theme.colors.primaryStatic[200]),
			colorText: toHex(theme.colors.primaryStatic[900]),
			colorPrimary: toHex(theme.colors.primaryStatic[600]),
			colorInputBackground: toHex(theme.colors.primaryStatic[300]),
			colorInputText: toHex(theme.colors.primaryStatic[900]),
		},
	},
} as const
