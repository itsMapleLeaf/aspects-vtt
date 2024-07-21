import { partial } from "convex-helpers/validators"
import { v } from "convex/values"
import { Effect, pipe } from "effect"
import { Doc, Id } from "./_generated/dataModel"
import {
	collectDocs,
	deleteDoc,
	getDoc,
	insertDoc,
	patchDoc,
	queryIndex,
} from "./lib/db.ts"
import { effectMutation, effectQuery } from "./lib/functions.ts"
import { ensureRoomOwner } from "./lib/rooms.ts"
import { getStorageUrl } from "./lib/storage.ts"
import schema from "./schema.ts"

export const list = effectQuery({
	args: {
		room: v.id("rooms"),
	},
	handler(args) {
		return pipe(
			ensureRoomOwner(args.room),
			Effect.flatMap((room) =>
				queryIndex("scenes", "room", ["room", room._id]),
			),
			Effect.flatMap(collectDocs),
			Effect.flatMap(
				Effect.forEach(normalizeScene, { concurrency: "unbounded" }),
			),
			Effect.orElseSucceed(() => []),
		)
	},
})

export const get = effectQuery({
	args: {
		id: v.id("scenes"),
	},
	handler(args) {
		return pipe(
			getDoc(args.id),
			Effect.tap((scene) => ensureRoomOwner(scene.room)),
			Effect.flatMap(normalizeScene),
			Effect.orElseSucceed(() => null),
		)
	},
})

export const create = effectMutation({
	args: schema.tables.scenes.validator.fields,
	handler(args) {
		return pipe(
			ensureRoomOwner(args.room),
			Effect.andThen(() => insertDoc("scenes", args)),
		)
	},
})

export const update = effectMutation({
	args: {
		...partial(schema.tables.scenes.validator.fields),
		id: v.id("scenes"),
	},
	handler({ id, ...args }) {
		return pipe(
			ensureSceneRoomOwner(id),
			Effect.flatMap(({ scene }) => patchDoc(scene._id, args)),
		)
	},
})

export const remove = effectMutation({
	args: {
		id: v.id("scenes"),
	},
	handler(args) {
		return pipe(
			ensureSceneRoomOwner(args.id),
			Effect.flatMap(({ scene }) => deleteDoc(scene._id)),
		)
	},
})

export function normalizeScene(scene: Doc<"scenes">) {
	return pipe(
		getStorageUrl(scene.background),
		Effect.catchTag("FileNotFoundError", () => Effect.succeed(null)),
		Effect.map((background) => ({
			...scene,
			background,
		})),
	)
}

export function ensureSceneRoomOwner(id: Id<"scenes">) {
	return Effect.gen(function* () {
		const scene = yield* getDoc(id)
		const room = yield* ensureRoomOwner(scene.room)
		return { scene, room }
	})
}
