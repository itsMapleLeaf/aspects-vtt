import { v } from "convex/values"
import { RACE_NAMES } from "~/features/characters/races.ts"
import { query } from "./lib/ents.ts"

export const get = query({
	args: {
		selection: v.array(
			v.union(
				v.object({ type: v.literal("character"), id: v.id("characters") }),
			),
		),
	},
	async handler(ctx, { selection }) {
		return {
			properties: characterPropertyMap,
			docs: await ctx
				.table("characters")
				.getManyX(selection.map((it) => it.id))
				.docs(),
		}
	},
})

type TypedEntityValue =
	| { type: "string"; options?: readonly { value: string; label: string }[] }
	| { type: "select"; options: readonly { value: string; label: string }[] }
	| { type: "number" }
	| { type: "boolean" }
	| { type: "array"; of: TypedEntityValue }
	| { type: "record"; of: TypedEntityValue }
	| { type: "object"; of: { [key: string]: TypedEntityValue } }
	| { type: "image" }

const characterPropertyMap = {
	name: { type: "string" },
	pronouns: {
		type: "string",
		options: [
			{ value: "he/him", label: "he/him" },
			{ value: "she/her", label: "she/her" },
			{ value: "they/them", label: "they/them" },
			{ value: "he/they", label: "he/they" },
			{ value: "she/they", label: "she/they" },
			{ value: "it/its", label: "it/its" },
		],
	},
	notes: { type: "string" },
	type: {
		type: "string",
		options: [
			{ value: "player", label: "Player" },
			{ value: "npc", label: "NPC" },
		],
	},
	health: { type: "number" },
	healthMaxOverride: { type: "number" },
	resolve: { type: "number" },
	resolveMaxOverride: { type: "number" },
	wealth: { type: "number" },
	visible: { type: "boolean" },
	nameVisible: { type: "boolean" },
	imageId: { type: "image" },
	race: {
		type: "string",
		options: RACE_NAMES.map((value) => ({ value, label: value })),
	},
	attributes: {
		type: "object",
		of: {
			strength: { type: "number" },
			sense: { type: "number" },
			mobility: { type: "number" },
			intellect: { type: "number" },
			wit: { type: "number" },
		},
	},
	conditions: {
		type: "array",
		of: { type: "string" },
	},
	aspectSkills: {
		type: "record",
		of: { type: "boolean" },
	},
} as const satisfies Record<string, TypedEntityValue>
