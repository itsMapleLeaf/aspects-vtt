export function wait<T>(ms: number, value?: T) {
	return new Promise<T>((resolve) => setTimeout(resolve, ms))
}

export async function throttle<T>(ms: number, promise: Promise<T>) {
	const [value] = await Promise.all([promise, wait(ms)])
	return value
}
