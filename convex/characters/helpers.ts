import { Effect, pipe } from "effect"
import { sum } from "lodash-es"
import { clamp } from "~/helpers/math.ts"
import { pick } from "~/helpers/object.ts"
import type { RequiredKeys } from "~/helpers/types.ts"
import { getAttributePower, normalizeAttributeValue } from "~/modules/attributes/helpers.ts"
import { Races } from "~/modules/races/data.ts"
import type { Doc, Id } from "../_generated/dataModel"
import { UnauthorizedError, getUserFromIdentityEffect } from "../auth/helpers.ts"
import { getDoc } from "../helpers/effect.ts"

export function normalizeCharacter(character: Doc<"characters">) {
	const race = character.race && Races.get(character.race)

	const stats = {
		strength: normalizeAttributeValue(character.strength),
		sense: normalizeAttributeValue(character.sense),
		mobility: normalizeAttributeValue(character.mobility),
		intellect: normalizeAttributeValue(character.intellect),
		wit: normalizeAttributeValue(character.wit),
	}

	const healthMax = sum(
		[stats.strength, stats.mobility, race?.healthBonus ?? 0].map(getAttributePower),
	)
	const health = clamp(character.health ?? healthMax, 0, healthMax)

	const resolveMax = sum(
		[stats.intellect, stats.wit, stats.sense, race?.resolveBonus ?? 0].map(getAttributePower),
	)
	const resolve = clamp(character.resolve ?? resolveMax, 0, resolveMax)

	return {
		name: "",
		pronouns: "",
		imageId: null,
		race: null,

		modifiers: [],
		learnedAspectSkills: [],

		ownerNotes: "",
		playerNotes: "",

		currency: 0,
		conditions: [],

		visible: false,
		nameVisible: false,
		playerId: null,

		...character,
		...stats,

		health,
		healthMax,

		resolve,
		resolveMax,
	}
}

export class CharacterAccessError {
	readonly _tag = "CharacterAccessError"
	constructor(readonly characterId: Id<"characters">) {}
}

type ProtectedCharacter<T extends Doc<"characters">> = RequiredKeys<
	Partial<T>,
	"_id" | "_creationTime" | "imageId" | "conditions" | "race"
>

export function protectCharacter<T extends Doc<"characters">>(character: T) {
	return Effect.gen(function* () {
		const user = yield* getUserFromIdentityEffect()
		const room = yield* getDoc(character.roomId)

		if (room.ownerId === user.clerkId || character.playerId === user.clerkId) {
			return character
		}

		if (character.visible && character.nameVisible) {
			return pick(character, [
				"_id",
				"_creationTime",
				"imageId",
				"conditions",
				"race",
				"name",
				"pronouns",
			]) as ProtectedCharacter<T>
		}

		if (character.visible) {
			return pick(character, [
				"_id",
				"_creationTime",
				"imageId",
				"conditions",
				"race",
			]) as ProtectedCharacter<T>
		}

		return yield* Effect.fail(new CharacterAccessError(character._id))
	})
}

export function ensureViewerCharacterPermissions(characterId: Id<"characters">) {
	return Effect.gen(function* () {
		const { user, character } = yield* Effect.all({
			user: getUserFromIdentityEffect(),
			character: getDoc(characterId),
		})
		const room = yield* getDoc(character.roomId)
		if (room.ownerId === user.clerkId || character.playerId === user.clerkId) {
			return { user, character, room }
		}
		return yield* Effect.fail(new UnauthorizedError())
	})
}

export class CharactersNotInRoomError {
	readonly _tag = "CharactersNotInRoomError"
	constructor(readonly charactersNotInRoom: Array<Doc<"characters">>) {}
}

export function ensureRoomHasCharacters(
	roomId: Id<"rooms">,
	characterIds: ReadonlyArray<Id<"characters">>,
) {
	return pipe(
		Effect.forEach(characterIds, getDoc, { concurrency: "unbounded" }),
		Effect.flatMap((characters) => {
			const charactersNotInRoom = characters.filter((c) => c.roomId !== roomId)
			return charactersNotInRoom.length === 0 ?
					Effect.succeed(characters)
				:	Effect.fail(new CharactersNotInRoomError(charactersNotInRoom))
		}),
	)
}
