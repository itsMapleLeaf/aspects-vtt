import type { WithoutSystemFields } from "convex/server"
import { ConvexError, type ObjectType } from "convex/values"
import { Result } from "../../app/common/Result.ts"
import type { OmitByValue } from "../../app/common/types.ts"
import type { Doc, Id } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { getUserFromIdentity } from "../auth/helpers.ts"
import type { Branded } from "../helpers/convex.ts"
import { RoomModel } from "../rooms/RoomModel.ts"
import type { characterProperties } from "./functions.ts"

const characterDefaults = {
	// profile
	name: "",
	pronouns: "",
	imageId: null,
	race: "",
	coreAspect: null,
	aspectSkills: [],

	// stats
	damage: 0,
	damageThreshold: null,
	fatigue: 0,
	fatigueThreshold: null,
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

	// visibility
	visible: false,
	nameVisible: false,
	playerId: null,
} satisfies OmitByValue<ObjectType<typeof characterProperties>, null | undefined>

export class CharacterModel {
	readonly ctx
	readonly doc
	readonly data

	constructor(ctx: QueryCtx, doc: Doc<"characters">) {
		this.ctx = ctx

		const docWithDefaults = { ...characterDefaults, ...doc }

		this.doc = doc

		this.data = {
			...docWithDefaults,
			damageThreshold: doc.damageThreshold ?? docWithDefaults.strength + docWithDefaults.mobility,
			fatigueThreshold:
				doc.fatigueThreshold ??
				docWithDefaults.sense + docWithDefaults.intellect + docWithDefaults.wit,
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
		return await RoomModel.fromId(this.ctx, this.data.roomId).getValueOrThrow()
	}

	async getComputedData() {
		const room = await this.getRoom()
		const isRoomOwner = await room.isOwner()
		const user = await getUserFromIdentity(this.ctx).getValueOrThrow()
		const isCharacterOwner = isRoomOwner || this.data.playerId === user.clerkId
		const canSeeName = this.data.nameVisible || isCharacterOwner
		return {
			...this.data,
			isOwner: isCharacterOwner,
			displayName: canSeeName ? this.data.name : "???",
			displayPronouns: canSeeName ? this.data.pronouns : "",
		}
	}

	async update(ctx: MutationCtx, updates: Partial<WithoutSystemFields<Doc<"characters">>>) {
		const room = await this.getRoom()
		const isMember =
			(await room.isOwner()) || (await room.getIdentityPlayer().getValueOrNull()) != null
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
