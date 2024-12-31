export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function timeoutEffect(delay: number, callback: () => void) {
	const id = setTimeout(callback, delay)
	return () => clearTimeout(id)
}
