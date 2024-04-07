import type { WithoutSystemFields } from "convex/server"
import { ConvexError } from "convex/values"
import { Result } from "#app/common/Result.js"
import { UserModel } from "./UserModel.js"
import type { Doc, Id } from "./_generated/dataModel.js"
import type { MutationCtx, QueryCtx } from "./_generated/server.js"

export class RoomModel {
	private readonly ctx
	readonly data

	private constructor(ctx: QueryCtx, data: Doc<"rooms">) {
		this.ctx = ctx
		this.data = {
			...data,
			mapDimensions: data.mapDimensions ?? { width: 1000, height: 1000 },
			mapCellSize: data.mapCellSize ?? 50,
		}
	}

	static fromSlug(ctx: QueryCtx, slug: string) {
		return Result.fn(async () => {
			const data = await ctx.db
				.query("rooms")
				.withIndex("by_slug", (q) => q.eq("slug", slug))
				.unique()
			if (!data) {
				throw new ConvexError(`Couldn't find room with slug ${slug}`)
			}
			return new RoomModel(ctx, data)
		})
	}

	static fromId(ctx: QueryCtx, id: Id<"rooms">) {
		return Result.fn(async () => {
			const data = await ctx.db.get(id)
			if (!data) {
				throw new ConvexError(`Couldn't find room with id ${id}`)
			}
			return new RoomModel(ctx, data)
		})
	}

	async isOwner() {
		const user = await UserModel.fromIdentity(this.ctx)
		return this.data.ownerId === user.data.clerkId
	}

	async assertOwned() {
		if (!(await this.isOwner())) {
			throw new ConvexError("You don't have permission to access this room.")
		}
	}

	async getPlayers() {
		return await this.ctx.db
			.query("players")
			.withIndex("by_room", (q) => q.eq("roomId", this.data._id))
			.collect()
	}

	async getIdentityPlayer() {
		const user = await UserModel.fromIdentity(this.ctx)
		return this.ctx.db
			.query("players")
			.withIndex("by_room_and_user", (q) =>
				q.eq("roomId", this.data._id).eq("userId", user.data.clerkId),
			)
			.first()
	}

	async getClientPlayers() {
		if (!(await this.isOwner())) {
			return []
		}

		const players = this.ctx.db
			.query("players")
			.withIndex("by_room", (q) => q.eq("roomId", this.data._id))
	}

	async update(ctx: MutationCtx, args: Partial<WithoutSystemFields<Doc<"rooms">>>) {
		if (!(await this.isOwner())) {
			throw new ConvexError("You don't have permission to update this room.")
		}
		await ctx.db.patch(this.data._id, args)
		return new RoomModel(this.ctx, { ...this.data, ...args })
	}

	async delete(ctx: MutationCtx) {
		if (!(await this.isOwner())) {
			throw new ConvexError("You don't have permission to delete this room.")
		}
		await ctx.db.delete(this.data._id)
	}

	async join(ctx: MutationCtx) {
		const user = await UserModel.fromIdentity(ctx)

		const existing = await this.getIdentityPlayer()
		if (existing) return

		await ctx.db.insert("players", { userId: user.data.clerkId, roomId: this.data._id })
	}
}
