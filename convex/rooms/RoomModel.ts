import { getManyFrom, getOneFrom } from "convex-helpers/server/relationships"
import type { WithoutSystemFields } from "convex/server"
import { ConvexError } from "convex/values"
import { Result } from "../../app/helpers/Result.ts"
import type { Doc, Id } from "../_generated/dataModel.js"
import type { MutationCtx, QueryCtx } from "../_generated/server.js"
import { auth } from "../auth.ts"

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
			// const data = await ctx.table("rooms").get("slug", slug)
			const data = await getOneFrom(ctx.db, "rooms", "slug", slug)
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
		return this.data.owner === (await auth.getUserId(this.ctx))
	}

	async assertOwned() {
		if (!(await this.isOwner())) {
			throw new ConvexError("You don't have permission to access this room.")
		}
	}

	async getPlayers() {
		const rooms = await getManyFrom(this.ctx.db, "players", "roomId", this.data._id)
		return rooms ?? []
	}

	async update(ctx: MutationCtx, args: Partial<WithoutSystemFields<Doc<"rooms">>>) {
		if (!(await this.isOwner())) {
			throw new ConvexError("You don't have permission to update this room.")
		}
		await ctx.db.patch(this.data._id, args)
		// @ts-expect-error
		return new RoomModel(this.ctx, { ...this.data, ...args })
	}

	async delete(ctx: MutationCtx) {
		if (!(await this.isOwner())) {
			throw new ConvexError("You don't have permission to delete this room.")
		}
		await ctx.db.delete(this.data._id)
	}
}
