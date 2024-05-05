import { ColorSpace, OKLCH, parse, sRGB, serialize, to } from "colorjs.io/fn"
import { lerp } from "./common/math.ts"

ColorSpace.register(OKLCH)
ColorSpace.register(sRGB)

export const theme = {
	colors: {
		primary: generateOklchPalette({
			hue: `var(--theme-hue)`,
			minChroma: 0.15,
			maxChroma: 0.21,
			withTailwindAlpha: true,
		}),
		primaryStatic: generateOklchPalette({
			hue: 280,
			minChroma: 0.15,
			maxChroma: 0.21,
		}),
	},
}

function generateOklchPalette(args: {
	hue: number | string
	minChroma: number
	maxChroma: number
	withTailwindAlpha?: boolean
}) {
	const minLightness = 0.17
	const maxLightness = 1.0
	const colors: Record<number, string> = {}
	for (let i = 1; i <= 9; i++) {
		const lightness = lerp(minLightness, maxLightness, ((i - 1) / 8) ** 1.1)
		const chroma = lerp(args.minChroma, args.maxChroma, ((i - 1) / 8) ** 1)
		colors[i * 100] = `oklch(${lightness * 100}% ${chroma * 100}% ${args.hue} ${
			args.withTailwindAlpha ? `/ <alpha-value>` : ""
		})`
	}
	return colors
}

export function toHex(input: string) {
	return serialize(to(parse(input), sRGB), { format: sRGB.formats.hex })
}
