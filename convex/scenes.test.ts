import { expect, test } from "bun:test"
import type { Id } from "./_generated/dataModel"
import { createMockMutationCtx } from "./lib/testing.js"
import { list } from "./scenes.ts"

test("list returns scenes only for the given room", async () => {
	const queryCtx = createMockMutationCtx()

	const room1Id = await queryCtx.db.insert("rooms", {
		name: "room1",
		slug: "room1",
		ownerId: "user1" as Id<"users">,
	})

	const room2Id = await queryCtx.db.insert("rooms", {
		name: "room2",
		slug: "room2",
		ownerId: "user1" as Id<"users">,
	})

	await queryCtx.db.insert("scenes", {
		name: "scene1",
		roomId: room1Id,
		backgroundId: "background1" as Id<"_storage">,
	})

	await queryCtx.db.insert("scenes", {
		name: "scene2",
		roomId: room1Id,
		backgroundId: "background2" as Id<"_storage">,
	})

	await queryCtx.db.insert("scenes", {
		name: "scene3",
		roomId: room2Id,
		backgroundId: "background3" as Id<"_storage">,
	})

	const scenes = await list(queryCtx, {
		room: room1Id,
	})

	expect(scenes).toHaveLength(2)
})
