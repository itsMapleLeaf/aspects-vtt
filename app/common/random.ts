export function randomInt(...args: [min: number, max: number] | [max: number]) {
	const [min, max] = args.length === 1 ? [1, args[0]] : args
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function roll(sides: number) {
	return randomInt(1, sides)
}

export function randomItem<const T extends readonly unknown[]>(items: T) {
	return items[randomInt(items.length - 1)] as T extends readonly [unknown, ...unknown[]]
		? T[number]
		: T[number] | undefined
}
