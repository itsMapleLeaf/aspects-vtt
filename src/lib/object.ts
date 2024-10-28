export function groupBy<Item, const Key>(
	items: Iterable<Item>,
	keyFn: (item: Item) => Key,
) {
	const groups = new Map<Key, Item[]>()
	for (const item of items) {
		const key = keyFn(item)
		const group = groups.get(key) ?? []
		group.push(item)
		groups.set(key, group)
	}
	return groups
}

export function keyBy<T, K>(items: Iterable<T>, getKey: (item: T) => K) {
	const map = new Map<K, T>()
	for (const item of items) {
		map.set(getKey(item), item)
	}
	return map
}
