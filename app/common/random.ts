export function randomInt(...args: [min: number, max: number] | [max: number]) {
	const [min, max] = args.length === 1 ? [1, args[0]] : args
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function roll(sides: number) {
	return randomInt(1, sides)
}
