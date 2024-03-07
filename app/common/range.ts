export function* range(...args: [start: number, end: number] | [end: number]) {
	const [start, end] = args.length === 1 ? [0, args[0]] : args
	for (let i = start; i < end; i++) {
		yield i
	}
}
