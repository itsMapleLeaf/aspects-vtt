export function raise(error: string | object): never {
	if (typeof error === "string") {
		throw new Error(error)
	}
	throw error
}
