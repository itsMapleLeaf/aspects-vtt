import { ColorSpace, OKLCH, parse, sRGB, serialize, to } from "colorjs.io/fn"
import { lerp } from "../lib/math.ts"

ColorSpace.register(OKLCH)
ColorSpace.register(sRGB)

export const theme = {
	colors: {
		primary: {
			100: generatePrimaryColor(0 / 8),
			200: generatePrimaryColor(1 / 8),
			300: generatePrimaryColor(2 / 8),
			400: generatePrimaryColor(3 / 8),
			500: generatePrimaryColor(4 / 8),
			600: generatePrimaryColor(5 / 8),
			700: generatePrimaryColor(6 / 8),
			800: generatePrimaryColor(7 / 8),
			900: generatePrimaryColor(8 / 8),
		},
		primaryStatic: {
			100: generateStaticPrimaryColor(0 / 8),
			200: generateStaticPrimaryColor(1 / 8),
			300: generateStaticPrimaryColor(2 / 8),
			400: generateStaticPrimaryColor(3 / 8),
			500: generateStaticPrimaryColor(4 / 8),
			600: generateStaticPrimaryColor(5 / 8),
			700: generateStaticPrimaryColor(6 / 8),
			800: generateStaticPrimaryColor(7 / 8),
			900: generateStaticPrimaryColor(8 / 8),
		},
	},
}

function generatePrimaryColor(delta: number) {
	return generateOklchColor({
		hue: `var(--theme-hue)`,
		chromaRange: [0.15, 0.21],
		lightnessRange: [0.17, 1.0],
		delta,
		withTailwindAlpha: true,
	})
}

function generateStaticPrimaryColor(delta: number) {
	return generateOklchColor({
		hue: 280,
		chromaRange: [0.15, 0.21],
		lightnessRange: [0.17, 1.0],
		delta,
	})
}

function generateOklchColor(args: {
	hue: number | string
	chromaRange: [number, number]
	lightnessRange: [number, number]
	delta: number
	withTailwindAlpha?: boolean
}) {
	const lightness = lerp(...args.lightnessRange, args.delta ** 1.1)
	const chroma = lerp(...args.chromaRange, args.delta ** 1)
	const alpha = args.withTailwindAlpha ? `/ <alpha-value>` : ""
	return `oklch(${lightness * 100}% ${chroma * 100}% ${args.hue} ${alpha})`
}

export function toHex(input: string) {
	return serialize(to(parse(input), sRGB), { format: sRGB.formats.hex })
}
