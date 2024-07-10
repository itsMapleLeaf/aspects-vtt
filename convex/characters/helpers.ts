import { Effect, pipe } from "effect"
import { sum } from "lodash-es"
import { clamp } from "~/helpers/math.ts"
import { pick } from "~/helpers/object.ts"
import type { RequiredKeys } from "~/helpers/types.ts"
import type { Attribute } from "~/modules/attributes/data.ts"
import { getAttributePower, normalizeAttributeValue } from "~/modules/attributes/helpers.ts"
import { getCharacterAttributeDiceKind } from "~/modules/characters/helpers.ts"
import { boostDiceKind, getDiceKindApiInput, snagDiceKind } from "~/modules/dice/data.tsx"
import { getRace } from "~/modules/races/data.ts"
import type { Doc, Id } from "../_generated/dataModel"
import { getUserFromIdentityEffect, UnauthorizedError } from "../auth.ts"
import { Convex, getDoc } from "../helpers/effect.ts"

export function normalizeCharacter(character: Doc<"characters">) {
	return Effect.gen(function* () {
		const identity = yield* Convex.auth
			.getUserIdentity()
			.pipe(Effect.catchTag("NotLoggedInError", () => Effect.succeed(null)))

		const race = character.race && getRace(character.race)

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

		const defense = getAttributePower(stats.strength) + getAttributePower(stats.mobility)

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

			defense,

			isOwner: character.playerId != null && identity?.subject === character.playerId,
		}
	})
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

		const publicProperties = [
			"_id",
			"_creationTime",
			"imageId",
			"conditions",
			"race",
			"visible",
			"nameVisible",
		] as const

		if (character.visible && character.nameVisible) {
			return pick(character, [...publicProperties, "name", "pronouns"]) as ProtectedCharacter<T>
		}

		if (character.visible) {
			return pick(character, publicProperties) as ProtectedCharacter<T>
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
			return {
				user,
				room,
				character: yield* normalizeCharacter(character),
			}
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

export function getCharacterAttributeDiceInputs(args: {
	character: Doc<"characters">
	attribute: Attribute["id"]
	boostCount?: number
	snagCount?: number
}) {
	const attributeDiceKind = getCharacterAttributeDiceKind(args.character, args.attribute)

	let boostCount = args.boostCount ?? 0
	if (args.character.race) {
		const bonus = getRace(args.character.race)?.attributeRollBonuses?.[args.attribute]?.boost
		if (bonus) {
			boostCount += bonus
		}
	}

	return [
		getDiceKindApiInput(attributeDiceKind, 2),
		getDiceKindApiInput(boostDiceKind, boostCount),
		getDiceKindApiInput(snagDiceKind, args.snagCount ?? 0),
	]
}
