import { Effect } from "effect"
import type { Id } from "../_generated/dataModel"
import { getIdentityEffect } from "../auth/helpers.ts"
import { createDiceRolls } from "../dice/helpers.ts"
import { getDoc, insertDoc } from "../helpers/effect.ts"
import type { DiceInput } from "./types.ts"

export class EmptyMessageError {
	readonly _tag = "EmptyMessageError"
}

export function createMessages(
	inputs: ReadonlyArray<{ roomId: Id<"rooms">; content?: string; dice?: DiceInput[] }>,
) {
	return Effect.forEach(
		inputs,
		(input) =>
			Effect.gen(function* () {
				const content = input.content ?? ""
				const dice = input.dice ?? []
				const diceInputCount = dice.reduce((total, input) => total + input.count, 0)

				if (content.trim() === "" && diceInputCount === 0) {
					return yield* Effect.fail(new EmptyMessageError())
				}

				const identity = yield* getIdentityEffect()
				const diceRolls = Iterator.from(createDiceRolls(dice)).toArray()

				const id = yield* insertDoc("messages", {
					roomId: input.roomId,
					content,
					userId: identity.subject,
					diceRoll: diceRolls.length > 0 ? { dice: diceRolls } : undefined,
				})

				return yield* getDoc(id)
			}),
		{ concurrency: "unbounded" },
	)
}
