export function setWithout<T>(set: ReadonlySet<T>, item: T) {
	const clone = new Set(set)
	clone.delete(item)
	return clone
}

export function setToggle<T>(set: ReadonlySet<T>, item: T) {
	return set.has(item) ? setWithout(set, item) : new Set(set).add(item)
}
