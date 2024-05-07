import { dark } from "@clerk/themes"
import { expect } from "./common/expect.ts"
import { theme, toHex } from "./theme.ts"

export const clerkConfig = {
	telemetry: false,
	appearance: {
		baseTheme: dark,
		variables: {
			borderRadius: "0.25rem",
			// clerk doesn't accept oklch() :(
			colorBackground: toHex(expect(theme.colors.primaryStatic[200])),
			colorText: toHex(expect(theme.colors.primaryStatic[900])),
			colorPrimary: toHex(expect(theme.colors.primaryStatic[600])),
			colorInputBackground: toHex(expect(theme.colors.primaryStatic[300])),
			colorInputText: toHex(expect(theme.colors.primaryStatic[900])),
		},
	},
} as const
