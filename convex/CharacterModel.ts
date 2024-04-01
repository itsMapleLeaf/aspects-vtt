import type { WithoutSystemFields } from "convex/server"
import { ConvexError } from "convex/values"
import { Result } from "#app/common/Result.js"
import { clamp } from "#app/common/math.js"
import { pick } from "#app/common/object.js"
import { RoomModel } from "./RoomModel.ts"
import type { Doc, Id } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"

export class CharacterModel {
	readonly ctx
	readonly data

	constructor(ctx: QueryCtx, doc: Doc<"characters">) {
		this.ctx = ctx
		this.data = {
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

	async getVisibleData() {
		const room = await this.getRoom()
		const isRoomOwner = await room.isOwner()
		const isAssignedToIdentityUser = await this.isAssignedToIdentityUser()
		const propertiesVisible =
			isRoomOwner || isAssignedToIdentityUser || this.data.visibleTo === "everyone"
		const tokenVisible =
			isRoomOwner || isAssignedToIdentityUser || this.data.tokenVisibleTo === "everyone"

		if (!propertiesVisible && !tokenVisible) {
			return null
		}

		const player = room.data.players.find((player) => player.characterId === this.data._id)

		const damageThreshold = this.data.strength + this.data.mobility
		const fatigueThreshold = this.data.sense + this.data.intellect + this.data.wit

		const damageRatio = clamp(this.data.damage / damageThreshold, 0, 1)
		const fatigueRatio = clamp(this.data.fatigue / fatigueThreshold, 0, 1)

		return {
			...pick(this.data, [
				"_id",
				"name",
				"pronouns",
				"imageId",
				"playerNotes",
				"visibleTo",
				"tokenVisibleTo",
			]),

			...(propertiesVisible && {
				...pick(this.data, [
					"damage",
					"fatigue",
					"currency",
					"strength",
					"sense",
					"mobility",
					"intellect",
					"wit",
				]),
				damageThreshold,
				fatigueThreshold,
			}),

			...(tokenVisible && {
				...pick(this.data, ["tokenPosition"]),
				damageRatio,
				fatigueRatio,
			}),

			...(isRoomOwner && pick(this.data, ["ownerNotes"])),

			isPlayer: isAssignedToIdentityUser,
			playerId: player?.userId,
		}
	}

	async update(ctx: MutationCtx, updates: Partial<WithoutSystemFields<Doc<"characters">>>) {
		const room = await this.getRoom()
		const isOwner = await room.isOwner()

		if (isOwner) {
			await ctx.db.patch(this.data._id, updates)
			return
		}

		const propertiesVisible =
			isOwner || (await this.isAssignedToIdentityUser()) || this.data.visibleTo === "everyone"
		const tokenVisible =
			isOwner || (await this.isAssignedToIdentityUser()) || this.data.tokenVisibleTo === "everyone"

		if (!propertiesVisible && !tokenVisible) {
			throw new ConvexError("You don't have permission to update this character.")
		}

		await ctx.db.patch(this.data._id, {
			...pick(updates, ["playerNotes"]),

			...(propertiesVisible &&
				pick(updates, [
					"name",
					"pronouns",
					"imageId",

					"damage",
					"fatigue",
					"currency",

					"strength",
					"sense",
					"mobility",
					"intellect",
					"wit",
				])),

			...(tokenVisible && pick(updates, ["name", "pronouns", "imageId", "tokenPosition"])),
			...pick(updates, ["ownerNotes"]),
		})
	}

	async delete(ctx: MutationCtx) {
		const room = await this.getRoom()
		if (!(await room.isOwner())) {
			throw new ConvexError("You don't have permission to delete this character.")
		}
		await ctx.db.delete(this.data._id)
	}
}
