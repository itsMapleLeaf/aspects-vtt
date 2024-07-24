import { Console, Data, Effect, pipe } from "effect"
import { sum } from "lodash-es"
import { clamp } from "~/helpers/math.ts"
import { pick } from "~/helpers/object.ts"
import type { Attribute } from "~/modules/attributes/data.ts"
import { getAttributePower, normalizeAttributeValue } from "~/modules/attributes/helpers.ts"
import { getCharacterAttributeDiceKind } from "~/modules/characters/helpers.ts"
import { boostDiceKind, getDiceKindApiInput, snagDiceKind } from "~/modules/dice/data.tsx"
import { getRace } from "~/modules/races/data.ts"
import type { Doc, Id } from "../_generated/dataModel"
import { Convex, getDoc, withQueryCtx } from "../helpers/effect.ts"
import { getCurrentUser, getCurrentUserId } from "../users.ts"

export class MissingCharacterPermissionError extends Data.TaggedError(
	"MissingCharacterPermissionError",
) {
	constructor(readonly characterId: Id<"characters">) {
		super()
	}
}

export class CharactersNotInRoomError extends Data.TaggedError("CharactersNotInRoomError") {
	constructor(readonly charactersNotInRoom: Array<Doc<"characters">>) {
		super()
	}
}

export class MissingCharacterImageError extends Data.TaggedError("MissingCharacterImageError") {
	constructor(readonly characterId: Id<"characters">) {
		super()
	}
}

export class MissingImageSizesError extends Data.TaggedError("MissingImageSizeError") {
	constructor(readonly imageId: Id<"images">) {
		super()
	}
}

export type NormalizedCharacter = Effect.Effect.Success<ReturnType<typeof normalizeCharacter>>

export function normalizeCharacter(character: Doc<"characters">) {
	return Effect.gen(function* () {
		const normalized = yield* normalizeCharacterUnsafe(character)
		const userId = yield* getCurrentUserId()
		const room = yield* Convex.db.get(character.roomId)

		const isRoomOwner = room.owner === userId
		const isPlayer = character.player === userId

		if (isRoomOwner || isPlayer) {
			return { ...normalized, permission: "full" as const }
		}

		if (character.visible && character.nameVisible) {
			return {
				...pick(normalized, [
					"_id",
					"_creationTime",
					"roomId",
					"sceneId",
					"imageUrl",
					"conditions",
					"race",
					"visible",
					"nameVisible",
					"name",
					"pronouns",
				]),
				permission: "limitedWithName" as const,
			}
		}

		if (character.visible) {
			return {
				...pick(normalized, [
					"_id",
					"_creationTime",
					"roomId",
					"sceneId",
					"imageUrl",
					"conditions",
					"race",
					"visible",
					"nameVisible",
				]),
				permission: "limited" as const,
			}
		}

		return yield* new MissingCharacterPermissionError(character._id)
	}).pipe(Effect.tapError(Console.log))
}

export type UnsafeNormalizedCharacter = Effect.Effect.Success<
	ReturnType<typeof normalizeCharacterUnsafe>
>
export function normalizeCharacterUnsafe(character: Doc<"characters">) {
	return Effect.gen(function* () {
		const userId = yield* getCurrentUserId()

		const imageUrl: string | null = yield* pipe(
			Effect.fromNullable(character.image),
			Effect.catchTag(
				"NoSuchElementException",
				() => new MissingCharacterImageError(character._id),
			),
			Effect.flatMap((id) =>
				withQueryCtx((ctx) => ({
					storageId: ctx.db.system.normalizeId("_storage", id),
					imageId: ctx.db.normalizeId("images", id),
				})),
			),
			Effect.flatMap(({ storageId, imageId }) => {
				if (storageId) {
					return Convex.storage.getUrl(storageId)
				}
				if (imageId) {
					return pipe(
						Convex.db.get(imageId),
						Effect.flatMap((image) => Effect.fromNullable(image.sizes.at(-1))),
						Effect.catchTag("NoSuchElementException", () => new MissingImageSizesError(imageId)),
						Effect.flatMap((size) => Convex.storage.getUrl(size.storageId)),
					)
				}
				return Effect.succeed(null)
			}),
			Effect.orElseSucceed(() => null),
		)

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

		return {
			name: "",
			pronouns: "",
			race: null,

			modifiers: [],
			learnedAspectSkills: [],

			ownerNotes: "",
			playerNotes: "",

			currency: 0,
			conditions: [],

			visible: false,
			nameVisible: false,
			player: null,

			...character,
			...stats,

			imageUrl,

			health,
			healthMax,

			resolve,
			resolveMax,

			isOwner: character.player != null && userId === character.player,
		}
	})
}

export function ensureFullCharacterPermissions(characterId: Id<"characters">) {
	return Effect.gen(function* () {
		const user = yield* getCurrentUser()
		const character = yield* getCharacter(characterId)
		const room = yield* getDoc(character.roomId)

		if (character.permission !== "full") {
			return yield* new MissingCharacterPermissionError(character._id)
		}

		return {
			user,
			room,
			character,
		}
	})
}

export function getCharacter(characterId: Id<"characters">) {
	return Convex.db.get(characterId).pipe(Effect.flatMap(normalizeCharacter))
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
		Effect.flatMap((characters) => Effect.allSuccesses(characters.map(normalizeCharacterUnsafe))),
	)
}

export function getCharacterAttributeDiceInputs(args: {
	character: UnsafeNormalizedCharacter
	attribute: Attribute["id"]
	boostCount?: number
	snagCount?: number
}) {
	const attributeDiceKind = getCharacterAttributeDiceKind(
		normalizeAttributeValue(args.character[args.attribute]),
	)

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
