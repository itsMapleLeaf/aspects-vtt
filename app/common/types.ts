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

export type PartialKeys<T, K extends PropertyKey> = Omit<T, K> & {
	[k in Extract<K, keyof T>]?: T[k]
}

export type UndefinedToOptional<T> = Simplify<
	{
		[K in keyof T as undefined extends T[K] ? never : K]: T[K]
	} & {
		[K in keyof T as undefined extends T[K] ? K : never]?: T[K]
	}
>

// biome-ignore lint/complexity/noBannedTypes: this is useful when you need an "unknown" that doesn't swallow other types in the union
export type DietUnknown = {} | undefined | null

// biome-ignore lint/suspicious/noExplicitAny: this type is used to mark places that need a fix
export type TODO = any
