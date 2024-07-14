import { ConvexError } from "convex/values"
import { Result } from "../../app/helpers/Result.ts"
import type { Doc, Id } from "../_generated/dataModel"
import type { QueryCtx } from "../_generated/server.js"
import { RoomModel } from "../rooms/RoomModel.ts"

const characterDefaults = {
	// profile
	name: "",
	pronouns: "",
	imageId: null,
	race: null,

	// stats
	strength: 4,
	sense: 4,
	mobility: 4,
	intellect: 4,
	wit: 4,
	modifiers: [],

	// status
	currency: 0,

	// notes
	ownerNotes: "",
	playerNotes: "",

	// visibility
	visible: false,
	nameVisible: false,
	playerId: null,
}

/** @deprecated */
export class CharacterModel {
	readonly ctx
	readonly doc
	readonly data

	constructor(ctx: QueryCtx, doc: Doc<"characters">) {
		this.ctx = ctx
		this.doc = doc
		this.data = { ...characterDefaults, ...doc }
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
		return await RoomModel.fromId(this.ctx, this.data.roomId).getValueOrThrow()
	}
}
