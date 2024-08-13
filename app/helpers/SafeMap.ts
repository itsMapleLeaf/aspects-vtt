import { Iterator } from "iterator-helpers-polyfill"
import { unwrap } from "./errors.ts"
import { entries } from "./object.ts"
import type { AllKeys, AllValues } from "./types.ts"

/**
 * A read-only map of items with known keys, where get() is guaranteed to return
 * a value
 */
export class SafeMap<K, V> {
	readonly #items: ReadonlyMap<K, V>

	constructor(items: Iterable<readonly [K, V]>) {
		this.#items = new Map(items)
	}

	static mapRecord<
		const Input extends Record<PropertyKey, unknown>,
		const MappedValue,
	>(
		record: Input,
		map: (value: AllValues<Input>, key: AllKeys<Input>) => MappedValue,
	): SafeMap<keyof Input, MappedValue> {
		return new SafeMap(
			Iterator.from(entries(record)).map(([key, value]) => [
				key,
				map(value, key),
			]),
		)
	}

	get __keyType(): K {
		throw new Error("__keyType should not be accessed at runtime")
	}

	get __valueType(): V {
		throw new Error("__valueType should not be accessed at runtime")
	}

	get(key: K): V {
		return unwrap(this.#items.get(key), `key ${String(key)} not found`)
	}

	keys(): IterableIterator<K> {
		return this.#items.keys()
	}

	values(): IterableIterator<V> {
		return this.#items.values()
	}
}

export type SafeMapKey<T extends SafeMap<unknown, unknown>> = T["__keyType"]
export type SafeMapValue<T extends SafeMap<unknown, unknown>> = T["__valueType"]
