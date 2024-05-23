import { Effect } from "effect"
import { roll } from "../../../app/common/random.ts"
import type { Id } from "../../_generated/dataModel.js"
import { getDoc } from "../../helpers/effect.ts"
import type { QueryCtx } from "../../helpers/ents.ts"
import { getNotionImports } from "../../notionImports/functions.ts"
import type { AttributeId } from "../../notionImports/types.ts"

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
	initiativeAttributeId: AttributeId | null,
) {
	const character = await ctx.db.get(characterId)

	const notionImports = await getNotionImports(ctx)
	const attribute = notionImports?.attributes.find((it) => it.id === initiativeAttributeId)

	return character && attribute ? roll(character[attribute.key] ?? 4) : null
}
