export class List<T> extends Array<T> {
	static override of<T>(...items: T[]): List<T> {
		return new List(...items)
	}

	override includes<Others>(value: T | Others): value is T {
		return super.includes(value as T)
	}
}
