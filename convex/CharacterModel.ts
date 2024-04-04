import type { WithoutSystemFields } from "convex/server"
import { ConvexError } from "convex/values"
import { Result } from "#app/common/Result.js"
import { clamp } from "#app/common/math.js"
import { RoomModel } from "./RoomModel.ts"
import type { Doc, Id } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"

export class CharacterModel {
	readonly ctx
	readonly data

	constructor(ctx: QueryCtx, doc: Doc<"characters">) {
		this.ctx = ctx

		const getThreshold = (stat: number) =>
			stat === 20 ? 10
			: stat === 12 ? 8
			: 6

		const docWithDefaults = {
			name: "",
			pronouns: "",

			damage: 0,
			fatigue: 0,
			currency: 0,

			strength: 4,
			sense: 4,
			mobility: 4,
			intellect: 4,
			wit: 4,

			tokenPosition: { x: 0, y: 0 },
			...doc,
		}

		const damageThreshold = getThreshold(docWithDefaults.strength)
		const fatigueThreshold = getThreshold(docWithDefaults.sense)

		const damageRatio = clamp(docWithDefaults.damage / damageThreshold, 0, 1)
		const fatigueRatio = clamp(docWithDefaults.fatigue / fatigueThreshold, 0, 1)

		this.data = {
			...docWithDefaults,
			damageThreshold,
			fatigueThreshold,
			damageRatio,
			fatigueRatio,
		}
	}

	static get(ctx: QueryCtx, id: Id<"characters">) {
		return Result.fn(async () => {
			const doc = await ctx.db.get(id)
			if (!doc) {
				throw new ConvexError(`Couldn't find character with id ${id}`)
			}
			return new CharacterModel(ctx, doc)
		})
	}

	async getRoom() {
		return await RoomModel.fromId(this.ctx, this.data.roomId).unwrap()
	}

	async isAssignedToIdentityUser() {
		const room = await this.getRoom()
		return room.data.players.some((player) => player.characterId === this.data._id)
	}

	async update(ctx: MutationCtx, updates: Partial<WithoutSystemFields<Doc<"characters">>>) {
		const room = await this.getRoom()
		const isMember = (await room.isOwner()) || (await room.getIdentityPlayer()) != null
		if (!isMember) {
			throw new ConvexError("You don't have permission to update this character.")
		}
		await ctx.db.patch(this.data._id, updates)
	}

	async delete(ctx: MutationCtx) {
		const room = await this.getRoom()
		if (!(await room.isOwner())) {
			throw new ConvexError("You don't have permission to delete this character.")
		}
		await ctx.db.delete(this.data._id)
	}
}
