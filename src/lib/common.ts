import { IterableElement } from "type-fest"
import { MapKey, MapValue } from "type-fest/source/entry"

export const typed = <const T>(value: T) => value

export const readonly = <const Input>(input: Input) =>
	input as Input extends ReadonlyMap<unknown, unknown>
		? ReadonlyMap<MapKey<Input>, MapValue<Input>>
		: Input extends ReadonlySet<unknown>
			? ReadonlySet<IterableElement<ReturnType<Input["values"]>>>
			: Input extends readonly (infer V)[]
				? readonly V[]
				: Readonly<Input>
