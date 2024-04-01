import type { WithoutSystemFields } from "convex/server"
import { ConvexError, type GenericId } from "convex/values"
import { Result } from "#app/common/Result.js"
import { pick } from "#app/common/object.js"
import { CharacterModel } from "./CharacterModel.js"
import { UserModel } from "./UserModel.js"
import type { Doc, Id } from "./_generated/dataModel.js"
import type { MutationCtx, QueryCtx } from "./_generated/server.js"
import type { Branded } from "./helpers.js"

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

	async getIdentityPlayer() {
		const user = await UserModel.fromIdentity(this.ctx)
		return this.data.players.find((player) => player.userId === user.data.clerkId)
	}

	async getClientPlayers() {
		if (!(await this.isOwner())) {
			return []
		}

		const players = await Promise.all(
			this.data.players.map(async (player) => {
				const user = await UserModel.fromClerkId(this.ctx, player.userId)
				return (
					user && {
						...pick(user?.data, ["name", "avatarUrl", "clerkId"]),
						characterId: player.characterId,
					}
				)
			}),
		)
		return players.filter(Boolean)
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

		const hasPlayer = this.data.players.some((player) => player.userId === user.data.clerkId)
		if (hasPlayer) {
			return this
		}

		const players = [...this.data.players, { userId: user.data.clerkId, characterId: null }]
		await ctx.db.patch(this.data._id, { players })
		return new RoomModel(this.ctx, { ...this.data, players })
	}

	async getCharacters() {
		const characters = await this.ctx.db
			.query("characters")
			.withIndex("by_room", (q) => q.eq("roomId", this.data._id))
			.collect()
		return characters.map((data) => new CharacterModel(this.ctx, data))
	}

	async setPlayerCharacter(
		ctx: MutationCtx,
		userId: Branded<"clerkId">,
		characterId: Id<"characters"> | null,
	) {
		const players = this.data.players.map((player) => {
			if (player.userId === userId) {
				return { ...player, characterId }
			}
			if (player.characterId === characterId) {
				return { ...player, characterId: null }
			}
			return player
		})
		await this.update(ctx, { players })
	}

	async unsetPlayerCharacter(ctx: MutationCtx, characterId: GenericId<"characters">) {
		const players = this.data.players.map((player) => {
			if (player.characterId === characterId) {
				return { ...player, characterId: null }
			}
			return player
		})
		await this.update(ctx, { players })
	}
}
