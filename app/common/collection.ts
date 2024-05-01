import { Iterator } from "iterator-helpers-polyfill"

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

export function groupBy<Item, ResultKey extends PropertyKey>(
	items: Iterable<Item>,
	keyFn: (item: Item) => ResultKey,
): ReadonlyMap<ResultKey, readonly Item[]> {
	const result = new Map<ResultKey, Item[]>()
	for (const item of items) {
		const key = keyFn(item)
		const items = result.get(key) ?? []
		items.push(item)
		result.set(key, items)
	}
	return result
}

export function isEmpty(iterable: Iterable<unknown>): iterable is Iterable<never> {
	return Iterator.from(iterable).take(1).count() < 1
}

export function hasItems(iterable: Iterable<unknown>): boolean {
	return !isEmpty(iterable)
}

export function patchBy<T>(
	items: Iterable<T>,
	predicate: (item: T) => unknown,
	properties: Partial<T>,
) {
	return Iterator.from(items).map((it) => (predicate(it) ? { ...it, ...properties } : it))
}

export function patchByKey<T, K extends keyof T>(
	items: Iterable<T>,
	key: K,
	properties: Partial<T> & Record<K, T[K]>,
) {
	return patchBy(items, (item) => item[key] === properties[key], properties)
}

export function toggleInSet<T>(set: ReadonlySet<T>, item: T): ReadonlySet<T> {
	const modified = new Set(set)
	if (set.has(item)) {
		modified.delete(item)
	} else {
		modified.add(item)
	}
	return modified
}

export function setPresentInSet<T>(set: ReadonlySet<T>, item: T, present: boolean): ReadonlySet<T> {
	const modified = new Set(set)
	if (present) {
		modified.add(item)
	} else {
		modified.delete(item)
	}
	return modified
}
