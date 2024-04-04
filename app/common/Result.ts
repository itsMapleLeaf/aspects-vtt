import type { Awaitable } from "./types.ts"

export type ResultData<T> =
	| { ok: true; value: T; error: null }
	| { ok: false; value: null; error: ResultError }

export type ResultJson<T> =
	| { ok: true; value: T; error: null }
	| { ok: false; value: null; error: string }

export class Result<T> implements PromiseLike<ResultData<T>> {
	private constructor(private readonly fn: () => Awaitable<T>) {}

	static fn<T>(fn: () => Awaitable<T>) {
		return new Result(fn)
	}

	async unwrap() {
		return await this.fn()
	}

	async resolve(): Promise<ResultData<T>> {
		return Promise.resolve(this.fn()).then(
			(value) => ({ ok: true, value, error: null }),
			(error) => ({ ok: false, value: null, error: new ResultError(error) }),
		)
	}

	async json(): Promise<ResultJson<T>> {
		const result = await this.resolve()
		return result.ok ?
				{ ok: true, value: result.value, error: null }
			:	{ ok: false, value: null, error: result.error.message }
	}

	// biome-ignore lint/suspicious/noThenProperty: intentionally implementing PromiseLike
	then<TResult1 = ResultData<T>, TResult2 = never>(
		onfulfilled?: ((value: ResultData<T>) => TResult1 | PromiseLike<TResult1>) | null | undefined,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
	): PromiseLike<TResult1 | TResult2> {
		return this.resolve().then(onfulfilled, onrejected)
	}
}

export class ResultError extends Error {
	constructor(cause: unknown) {
		super("Result failed", { cause })
	}
}
