import type { WithoutSystemFields } from "convex/server"
import { ConvexError, type Infer } from "convex/values"
import { Result } from "#app/common/Result.js"
import { RoomModel } from "./RoomModel.ts"
import { UserModel } from "./UserModel.ts"
import type { Doc, Id } from "./_generated/dataModel"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import type { characterProperties } from "./characters"
import type { Branded } from "./helpers.ts"

const characterDefaults: Required<{
	[K in keyof typeof characterProperties]: Exclude<
		Infer<(typeof characterProperties)[K]>,
		undefined
	>
}> = {
	// profile
	name: "",
	pronouns: "",
	imageId: null,
	race: "",

	// stats
	damage: 0,
	fatigue: 0,
	currency: 0,

	// attributes
	strength: 4,
	sense: 4,
	mobility: 4,
	intellect: 4,
	wit: 4,

	// notes
	ownerNotes: "",
	playerNotes: "",

	// token properties
	tokenPosition: { x: 0, y: 0 },

	// visibility
	visible: false,
	nameVisible: false,
	playerId: null,
}

const getThreshold = (stat: number) =>
	stat === 20 ? 10
	: stat === 12 ? 8
	: 6

export class CharacterModel {
	readonly ctx
	readonly data

	constructor(ctx: QueryCtx, doc: Doc<"characters">) {
		this.ctx = ctx

		const docWithDefaults = { ...characterDefaults, ...doc }

		const damageThreshold = getThreshold(docWithDefaults.strength)
		const fatigueThreshold = getThreshold(docWithDefaults.sense)

		this.data = {
			...docWithDefaults,
			damageThreshold,
			fatigueThreshold,
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

	static fromPlayerId(ctx: QueryCtx, playerId: Branded<"clerkId">) {
		return Result.fn(async () => {
			const doc = await ctx.db
				.query("characters")
				.filter((q) => q.eq(q.field("playerId"), playerId))
				.first()
			if (!doc) {
				throw new ConvexError(`Couldn't find character with playerId ${playerId}`)
			}
			return new CharacterModel(ctx, doc)
		})
	}

	async getRoom() {
		return await RoomModel.fromId(this.ctx, this.data.roomId).unwrap()
	}

	async getComputedData() {
		const room = await this.getRoom()
		const isRoomOwner = await room.isOwner()
		const user = await UserModel.fromIdentity(this.ctx)
		const isCharacterOwner = isRoomOwner || this.data.playerId === user.data.clerkId
		const canSeeName = this.data.nameVisible || isCharacterOwner
		return {
			...this.data,
			isOwner: isCharacterOwner,
			displayName: canSeeName ? this.data.name : "???",
			displayPronouns: canSeeName ? this.data.pronouns : "",
		}
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

		if (updates.playerId) {
			// unset other characters' playerId if they're set to this one
			for await (const otherOwnedCharacter of ctx.db
				.query("characters")
				.filter((q) => q.eq(q.field("playerId"), updates.playerId))) {
				await ctx.db.patch(otherOwnedCharacter._id, { playerId: null })
			}
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
