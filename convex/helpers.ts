import { ConvexError, type Validator, v } from "convex/values"

export const nullish = <V extends Validator<NonNullable<unknown>, false, string>>(validator: V) =>
	v.optional(v.union(v.null(), validator))

export function withResultResponse<Args extends unknown[], Data>(handler: (...args: Args) => Data) {
	return async function wrappedHandler(...args: Args) {
		try {
			return { ok: true, data: await handler(...args) } as const
		} catch (error) {
			if (error instanceof ConvexError) {
				return { ok: false, error: error.message } as const
			}
			return { ok: false, error: "An unexpected error occurred." } as const
		}
	}
}
