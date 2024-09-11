import * as convexAuth from "@convex-dev/auth/server"
import { ConvexError } from "convex/values"
import { Id } from "../_generated/dataModel"
import type { EntQueryCtx } from "./ents.ts"

function UnauthenticatedError() {
	return new ConvexError("You must be logged in to perform this action.")
}

function UserNotFoundError(userId: Id<"users">) {
	return new ConvexError(`User with ID "${userId}" not found.`)
}

export async function getAuthUserId(ctx: EntQueryCtx) {
	const id = await convexAuth.getAuthUserId(ctx)
	if (!id) {
		throw UnauthenticatedError()
	}
	return id
}

export async function getAuthUser(ctx: EntQueryCtx) {
	const id = await getAuthUserId(ctx)
	const user = await ctx.table("users").get(id)
	if (!user) {
		throw UserNotFoundError(id)
	}
	return user
}
