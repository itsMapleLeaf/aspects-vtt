import type { FunctionReference, FunctionReturnType } from "convex/server"
import { ConvexError } from "convex/values"

export type ResultResponse<T> =
	| { ok: true; data: T; error?: undefined }
	| { ok: false; data?: undefined; error: string }

export type ResultResponseData<T extends ResultResponse<unknown>> = NonNullable<T["data"]>

export type ResultQueryData<T extends FunctionReference<"query">> = ResultResponseData<
	FunctionReturnType<T>
>

export function withResultResponse<Args extends unknown[], Data>(handler: (...args: Args) => Data) {
	return async function wrappedHandler(...args: Args): Promise<ResultResponse<Awaited<Data>>> {
		try {
			return { ok: true, data: await handler(...args) }
		} catch (error) {
			if (error instanceof ConvexError) {
				return { ok: false, error: error.message }
			}
			return { ok: false, error: "An unexpected error occurred." }
		}
	}
}
