import * as convexAuth from "@convex-dev/auth/server"
import type { Auth } from "convex/server"
import { ConvexError } from "convex/values"
import { Data, Effect, pipe } from "effect"
import type { EntQueryCtx } from "./ents.ts"

export class UnauthenticatedError extends ConvexError<string> {
	constructor() {
		super("You must be logged in to perform this action.")
	}
}

export class InaccessibleError extends ConvexError<string> {
	constructor(details: { id?: string; collection?: string }) {
		super(
			[
				"Operation failed: either the requested entity does not exist, or you do not have access to it.",
				`ID: ${details.id}`,
				`Collection: ${details.collection}`,
			].join("\n"),
		)
	}
}

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
	message: string
}> {
	constructor(userId: string) {
		super({
			message: `User with ID "${userId}" not found.`,
		})
	}
}

export function getAuthUserId(ctx: { auth: Auth }) {
	return pipe(
		Effect.promise(() => convexAuth.getAuthUserId(ctx)),
		Effect.filterOrFail(
			(id) => id != null,
			() => new UnauthenticatedError(),
		),
	)
}

export function getAuthUser(ctx: EntQueryCtx) {
	return pipe(
		getAuthUserId(ctx),
		Effect.flatMap((userId) =>
			Effect.filterOrDieMessage(
				Effect.promise(() => ctx.table("users").get(userId)),
				(user) => user != null,
				`User with ID "${userId}" not found.`,
			),
		),
	)
}
