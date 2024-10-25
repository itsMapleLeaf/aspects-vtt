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
