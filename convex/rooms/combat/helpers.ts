import { Effect } from "effect"
import { roll } from "../../../app/helpers/random.ts"
import { getAttribute, type Attribute } from "../../../app/modules/attributes/data.ts"
import type { Id } from "../../_generated/dataModel.js"
import type { QueryCtx } from "../../_generated/server.js"
import { getDoc } from "../../helpers/effect.ts"

class CombatInactiveError {
	readonly _tag = "CombatInactiveError"
}

export function getRoomCombat(roomId: Id<"rooms">) {
	return Effect.gen(function* () {
		const room = yield* getDoc(roomId)
		return room?.combat ?? (yield* Effect.fail(new CombatInactiveError()))
	})
}

export async function getInitiativeRoll(
	ctx: QueryCtx,
	characterId: Id<"characters">,
	initiativeAttributeId: Attribute["id"] | null,
) {
	const character = await ctx.db.get(characterId)
	const attribute = initiativeAttributeId ? getAttribute(initiativeAttributeId) : null
	return character && attribute ? roll(character[attribute.id] ?? 4) : null
}
