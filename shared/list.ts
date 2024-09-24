export class List<T> extends Array<T> {
	static override of<T>(...items: T[]): List<T> {
		return new List(...items)
	}

	static const<const T>(...items: T[]): List<T> {
		return new List(...items)
	}

	static values<const T>(record: Record<PropertyKey, T>) {
		return List.of(...Object.values(record))
	}

	override includes<Others>(value: T | Others): value is T {
		return super.includes(value as T)
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
}
