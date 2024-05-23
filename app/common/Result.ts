import type { Awaitable } from "./types.ts"

export type ResultData<T> =
	| { ok: true; value: T; error: null }
	| { ok: false; value: null; error: unknown }

export type ResultJson<T> =
	| { ok: true; value: T; error: null }
	| { ok: false; value: null; error: string }

export class Result<T> implements PromiseLike<ResultData<T>> {
	private constructor(private readonly fn: () => Awaitable<T>) {}

	static fn<T>(fn: () => Awaitable<T>) {
		return new Result(fn)
	}

	map<U>(fn: (value: Awaited<T>) => Awaitable<U>): Result<U> {
		return Result.fn(async () => fn(await this.fn()))
	}

	async resolve(): Promise<ResultData<T>> {
		try {
			const value = await this.fn()
			return { ok: true, value, error: null }
		} catch (error) {
			return { ok: false, value: null, error }
		}
	}

	async getValueOrThrow(): Promise<T> {
		return await this.fn()
	}

	async getValueOrNull(): Promise<T | null> {
		try {
			return await this.fn()
		} catch {
			return null
		}
	}

	async getValueOrDefault(defaultValue: T): Promise<T> {
		const { ok, value } = await this.resolve()
		return ok ? value : defaultValue
	}

	async resolveJson(): Promise<ResultJson<T>> {
		const result = await this.resolve()
		return result.ok ?
				{ ok: true, value: result.value, error: null }
			:	{
					ok: false,
					value: null,
					error: result.error instanceof Error ? result.error.message : String(result.error),
				}
	}

	// biome-ignore lint/suspicious/noThenProperty: intentionally implementing PromiseLike
	then<TResult1 = ResultData<T>, TResult2 = never>(
		onfulfilled?: ((value: ResultData<T>) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.resolve().then(onfulfilled, onrejected)
	}
}
