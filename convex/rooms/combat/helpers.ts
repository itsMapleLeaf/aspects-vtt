import { Data, Effect, pipe } from "effect"
import { roll } from "../../../app/helpers/random.ts"
import {
	type Attribute,
	getAttribute,
} from "../../../app/modules/attributes/data.ts"
import type { Doc, Id } from "../../_generated/dataModel.js"
import type { QueryCtx } from "../../_generated/server.js"
import type { LocalQueryCtx } from "../../api.ts"

class CombatInactiveError extends Data.TaggedError("CombatInactiveError")<{
	readonly room: Doc<"rooms">
}> {}

export function getRoomCombat(ctx: LocalQueryCtx, roomId: Id<"rooms">) {
	return pipe(
		ctx.db.get(roomId),
		Effect.flatMap((room) =>
			room.combat ?
				Effect.succeed(room.combat)
			:	new CombatInactiveError({ room }),
		),
	)
}

export async function getInitiativeRoll(
	ctx: QueryCtx,
	characterId: Id<"characters">,
	initiativeAttributeId: Attribute["id"] | null,
) {
	const character = await ctx.db.get(characterId)
	const attribute =
		initiativeAttributeId ? getAttribute(initiativeAttributeId) : null
	return character && attribute ? roll(character[attribute.id] ?? 4) : null
}
