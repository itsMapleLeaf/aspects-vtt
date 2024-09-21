import * as convexAuth from "@convex-dev/auth/server"
import type { Auth } from "convex/server"
import { ConvexError } from "convex/values"
import type { Id } from "../_generated/dataModel.d.ts"
import type { EntQueryCtx } from "./ents.ts"

export class UnauthenticatedError extends ConvexError<string> {
	constructor() {
		super("You must be logged in to perform this action.")
	}
}

export class InaccessibleError extends ConvexError<string> {
	constructor(readonly details: { id?: string; collection?: string }) {
		super(
			[
				"Operation failed: either the requested entity does not exist, or you do not have access to it.",
				`ID: ${details.id}`,
				`Collection: ${details.collection}`,
			].join("\n"),
		)
	}
}

export class UserNotFoundError extends Error {
	constructor(userId: string) {
		super(`User with ID "${userId}" not found.`)
	}
}

export async function getAuthUserId(ctx: { auth: Auth }) {
	return await convexAuth.getAuthUserId(ctx)
}

export async function getAuthUserIdOrThrow(ctx: { auth: Auth }) {
	const id = await getAuthUserId(ctx)
	if (!id) {
		throw new UnauthenticatedError()
	}
	return id
}

export async function getAuthUser(ctx: EntQueryCtx) {
	const id = await getAuthUserId(ctx)
	if (!id) {
		return null
	}
	const user = await ctx.table("users").get(id)
	if (!user) {
		throw new UserNotFoundError(id)
	}
	return user
}

export type ProtectedCtx<Ctx> = Ctx & { userId: Id<"users"> }

export function createAuthGate<AuthorizeResult>(
	authorize: () => AuthorizeResult,
) {
	return async function next<Result, Fallback>({
		onAuthorized,
		onUnauthorized = () => {
			throw new UnauthenticatedError()
		},
	}: {
		onAuthorized: (input: NonNullable<Awaited<AuthorizeResult>>) => Result
		onUnauthorized?: () => Fallback
	}) {
		const result = await authorize()
		if (result != null) {
			return onAuthorized(result)
		}
		return onUnauthorized()
	}
}

export const ensureUser = (ctx: { auth: Auth }) =>
	createAuthGate(() => getAuthUserId(ctx))
