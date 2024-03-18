type RangeArgs = [start: number, end: number] | [end: number]

export function* range(...args: RangeArgs) {
	const [start, end] = args.length === 1 ? [0, args[0]] : args
	for (let i = start; i < end; i++) {
		yield i
	}
}

range.array = function rangeArray(...args: RangeArgs) {
	return [...range(...args)]
}
