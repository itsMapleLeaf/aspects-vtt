import { ColorSpace, OKLCH, sRGB, serialize, to } from "colorjs.io/fn"

ColorSpace.register(OKLCH)
ColorSpace.register(sRGB)

export const theme = {
	colors: {
		primary: generateOklchPalette({
			hue: 280,
			minChroma: 0.06,
			maxChroma: 0.15,
		}),
	},
}

function generateOklchPalette(args: { hue: number; minChroma: number; maxChroma: number }) {
	const minLightness = 0.17
	const maxLightness = 1.0
	const colors: Record<number, string> = {}
	for (let i = 1; i <= 9; i++) {
		const lightness = lerp(minLightness, maxLightness, ((i - 1) / 8) ** 1.1)
		const chroma = lerp(args.minChroma, args.maxChroma, ((i - 1) / 8) ** 1)
		colors[i * 100] = serialize(to({ space: OKLCH, coords: [lightness, chroma, args.hue] }, sRGB), {
			format: sRGB.formats.hex,
		})
	}
	return colors
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}
