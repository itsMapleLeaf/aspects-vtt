export function keyedBy<Item, ResultKey>(
	items: Iterable<Item>,
	keyFn: (item: Item) => ResultKey,
): ReadonlyMap<ResultKey, Item> {
	const result = new Map<ResultKey, Item>()
	for (const item of items) {
		result.set(keyFn(item), item)
	}
	return result
}

export function keyedByProperty<Item, Key extends keyof Item>(
	items: Iterable<Item>,
	key: Key,
): ReadonlyMap<Item[Key], Item> {
	return keyedBy(items, (item) => item[key])
}
