import type { IterableElement } from "type-fest"

export class List<T> extends Array<T> {
	static override from<Items extends Iterable<unknown>>(
		input?: Items | null | undefined,
	): List<IterableElement<Items>>
	static override from<T>(
		input?: ArrayLike<T> | Iterable<T> | null | undefined,
	): List<T>
	static override from<T>(
		input?: ArrayLike<T> | Iterable<T> | null | undefined,
	): List<T> {
		const list = new List<T>()
		if (input == null) return list
		for (const [index, value] of Array.from(input).entries()) {
			list[index] = value
		}
		return list
	}

	static override of<Items extends unknown[]>(
		...items: Items
	): List<Items[number]>
	static override of<T>(...items: T[]): List<T>
	static override of<Items extends unknown[]>(
		...items: Items
	): List<Items[number]> {
		return List.from(Array.of(...items))
	}

	static const<const T>(...items: T[]): List<T> {
		return List.from(items)
	}

	static keys<const T extends PropertyKey>(record: Record<T, unknown>) {
		return List.from(Object.keys(record)) as List<T>
	}

	static values<const T>(record: Record<PropertyKey, T>) {
		return List.from(Object.values(record))
	}

	override map<U>(fn: (value: T, index: number, list: List<T>) => U) {
		return List.from(super.map((value, index) => fn(value, index, this)))
	}

	override includes<Others>(value: T | Others): value is T {
		return super.includes(value as T)
	}

	override indexOf<Others>(value: T | Others, fromIndex?: number) {
		return super.indexOf(value as T, fromIndex)
	}

	array(): readonly T[] {
		return this
	}

	select<U extends T>(
		fn: (value: T, index: number, list: List<T>) => value is U,
	): List<U>
	select(fn: (value: T, index: number, list: List<T>) => unknown): List<T>
	select(fn: (value: T, index: number, list: List<T>) => unknown) {
		return List.from(super.filter((value, index) => fn(value, index, this)))
	}

	compact() {
		return this.select((it): it is NonNullable<T> => it != null)
	}

	unique() {
		return List.from(new Set(this))
	}

	mapToObject<K extends PropertyKey, V>(
		fn: (value: T, index: number, list: this) => readonly [K, V],
	) {
		return Object.fromEntries(
			this.map((value, index) => fn(value, index, this)),
		) as Record<K, V>
	}

	sum(): number {
		let total = 0
		for (const item of this) {
			total += typeof item === "number" ? item : 0
		}
		return total
	}

	without(...values: T[]) {
		const valueSet = new Set(values)
		return List.from(this.filter((it) => !valueSet.has(it)))
	}

	moveValue(value: T, toIndex: number) {
		const index = this.indexOf(value)
		if (index === -1) return this

		const result = List.from(this)
		const removed = result.splice(index, 1)
		result.splice(toIndex, 0, ...removed)
		return result
	}

	count(value: T) {
		return this.filter((it) => it === value).length
	}
}
