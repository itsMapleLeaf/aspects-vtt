/** Like omit, but ensures the keys exist in the target object, and preserves union types */
export type StrictOmit<T extends object, K extends keyof T> = Simplify<Pick<T, Exclude<keyof T, K>>>

/** Merge two types, overwriting keys in A with keys in B */
export type Overwrite<A extends object, B extends object> = Simplify<
	B & StrictOmit<A, Extract<keyof B, keyof A>>
>

/** Simplify complex types into a flat object */
export type Simplify<T extends object> = { [K in keyof T]: T[K] } & {}

/** Represents all JS falsy values */
export type Falsy = false | null | undefined | 0 | 0n | ""

export type Nullish<T> = T | null | undefined

/** Creates a new object type which disallows properties of the given type */
export type Disallowed<T extends object> = {
	[K in keyof T]?: never
}

/** Pick properties in an object type whose values are assignable to the given type */
export type PickByValue<Source, Value> = Simplify<{
	[K in keyof Source as Source[K] extends Value ? K : never]: Source[K]
}>

/** Omit properties in an object type whose values are assignable to the given type */
export type OmitByValue<Source, Value> = Simplify<{
	[K in keyof Source as Source[K] extends Value ? never : K]: Source[K]
}>

export type Awaitable<T> = T | PromiseLike<T>

export type MaybePromise<T> = T | Promise<T>

export type OptionalKeys<T, K extends keyof T> = Simplify<Omit<T, K> & Partial<Pick<T, K>>>

export type RequiredKeys<T, K extends keyof T> = Simplify<Omit<T, K> & Required<Pick<T, K>>>

/** @deprecated Use OptionalKeys */
export type PartialKeys<T, K extends keyof T> = OptionalKeys<T, K>

export type UndefinedToOptional<T> = Simplify<
	{
		[K in keyof T as undefined extends T[K] ? never : K]: T[K]
	} & {
		[K in keyof T as undefined extends T[K] ? K : never]?: T[K]
	}
>

// biome-ignore lint/complexity/noBannedTypes: this is intentional
export type DietUnknown = {} | undefined | null

// biome-ignore lint/suspicious/noExplicitAny: this is for non-explicit any placeholders
export type TODO = any

export type ValueOf<T> = T[keyof T]

export type Expect<T extends true> = T

export type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

/** Adds optional properties of every union member */
export type Exhaustive<T> = Simplify<ExhaustiveWithKeys<T, AllKeys<T>>>
type ExhaustiveWithKeys<T, K extends PropertyKey> =
	T extends object ? { [P in Extract<K, keyof T>]: T[P] } & { [P in Exclude<K, keyof T>]?: never }
	:	never

/**
 * Define the type of a value inline. Useful for defining the type of inferred object properties
 *
 * @example
 * 	// before
 * 	type Config = {
 * 		a: SomeSpecificString
 * 		b: number
 * 	}
 * 	const config = makeConfig<Config>({
 * 		a: "the",
 * 		b: 42,
 * 	})
 *
 * 	// after
 * 	const config = makeConfig({
 * 		a: typed<SomeSpecificString>("the"),
 * 		b: 42,
 * 	})
 */
export const typed = <T>(value: T) => value

export type AllKeys<T> = T extends NonNullable<unknown> ? keyof T : never

export type AllValues<T> = T extends NonNullable<unknown> ? T[keyof T] : never
