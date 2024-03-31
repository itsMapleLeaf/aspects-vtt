import { ConvexError } from "convex/values"
import type { PartialKeys, StrictOmit } from "#app/common/types.js"
import type { Doc } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { BrandedString } from "./helpers.ts"

export type UserData = PartialKeys<StrictOmit<Doc<"users">, "_creationTime">, "_id">

export class UserModel {
	readonly data

	private constructor(data: UserData) {
		this.data = data
	}

	static async fromClerkId(ctx: QueryCtx, clerkId: BrandedString<"clerkId">) {
		const data = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
			.unique()
		return data && new UserModel(data)
	}

	static async fromIdentity(ctx: QueryCtx) {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new ConvexError("Not logged in")
		}

		const clerkId = identity.subject as BrandedString<"clerkId">

		let data

		data = await ctx.db
			.query("users")
			.withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
			.unique()

		data ??= {
			name: identity.preferredUsername || identity.nickname || identity.name || identity.subject,
			avatarUrl: identity.pictureUrl,
		}

		return new UserModel({
			_id: data._id,
			name: data.name,
			avatarUrl: data.avatarUrl,
			clerkId: clerkId,
		})
	}

	async update(ctx: MutationCtx, updates: Partial<StrictOmit<UserData, "_id" | "clerkId">>) {
		if (this.data._id) {
			await ctx.db.patch(this.data._id, updates)
		} else {
			const { _id, ...data } = this.data
			await ctx.db.insert("users", { ...data, ...updates })
		}
		return new UserModel({ ...this.data, ...updates })
	}
}
