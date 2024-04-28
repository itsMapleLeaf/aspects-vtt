import { Client, isFullBlock, isFullPage } from "@notionhq/client"
import type {
	PageObjectResponse,
	QueryDatabaseResponse,
	RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { brandedString } from "convex-helpers/validators"
import { type Infer, v } from "convex/values"
import { Console, Effect, Option, pipe } from "effect"
import { Iterator } from "iterator-helpers-polyfill"
import { raise } from "#app/common/errors.js"
import { lines } from "#app/common/string.js"
import { internal } from "./_generated/api"
import { internalAction, internalMutation, query } from "./_generated/server"
import { convexEnv } from "./env.ts"
import type { Branded } from "./helpers.ts"

export const notionImportProperties = {
	attributes: v.array(
		v.object({
			id: v.optional(brandedString("attributes")),
			name: v.string(),
			description: v.string(),
			key: v.union(
				v.literal("strength"),
				v.literal("sense"),
				v.literal("mobility"),
				v.literal("intellect"),
				v.literal("wit"),
			),
		}),
	),
	races: v.array(
		v.object({
			id: v.optional(brandedString("races")),
			name: v.string(),
			description: v.string(),
			abilities: v.array(
				v.object({
					name: v.string(),
					description: v.string(),
				}),
			),
		}),
	),
	aspects: v.array(
		v.object({
			id: v.optional(brandedString("aspects")),
			name: v.string(),
			description: v.string(),
			ability: v.object({
				name: v.string(),
				description: v.string(),
			}),
		}),
	),
	generalSkills: v.array(
		v.object({
			id: v.optional(brandedString("generalSkills")),
			name: v.string(),
			description: v.string(),
		}),
	),
	aspectSkills: v.array(
		v.object({
			id: v.optional(brandedString("aspectSkills")),
			name: v.string(),
			description: v.string(),
			aspects: v.array(brandedString("aspectName")),
		}),
	),
}

export const migrate = internalMutation(async (ctx) => {
	for await (const item of ctx.db.query("notionImports")) {
		const newItem = Object.fromEntries(
			Object.entries(item).map(([key, value]) =>
				Array.isArray(value)
					? ([
							key,
							value.map((item) => ({ ...item, id: `${key}:${crypto.randomUUID()}` })),
						] as const)
					: ([key, value] as const),
			),
		)

		await ctx.db.replace(item._id, newItem)
	}
})

export const importData = internalAction({
	async handler(ctx) {
		const data = await Effect.runPromise(
			Effect.all(
				{
					aspects: Effect.tryPromise(() => getAspects()),
					aspectSkills: Effect.tryPromise(() => getAspectSkills()),
					attributes: Effect.tryPromise(() => getAttributes()),
					generalSkills: Effect.tryPromise(() => getGeneralSkills()),
					races: getRaces(),
				},
				{ concurrency: "inherit" },
			),
		)
		await ctx.runMutation(internal.notionImports.create, data)
	},
})

export const get = query({
	async handler(ctx) {
		return await ctx.db.query("notionImports").order("desc").first()
	},
})

export const create = internalMutation({
	args: notionImportProperties,
	async handler(ctx, args) {
		await ctx.db.insert("notionImports", args)
	},
})

function createNotionClient() {
	return Effect.try({
		try() {
			return new Client({
				auth: convexEnv().NOTION_API_SECRET,
			})
		},
		catch(cause) {
			return new Error("Failed to create notion API client", { cause })
		},
	})
}

function getDatabasePages(databaseId: string) {
	return Effect.gen(function* () {
		const client = yield* createNotionClient()
		return yield* Effect.tryPromise({
			async try() {
				const response = await client.databases.query({
					database_id: databaseId,
				})
				return response.results.map(asFullPage)
			},
			catch(cause) {
				return new Error("Failed to fetch database pages", { cause })
			},
		})
	})
}

function getRaces() {
	return Effect.gen(function* getRaces() {
		const pages = yield* getDatabasePages(convexEnv().NOTION_RACES_DATABASE_ID)
		const effects = pages.map(function createPageEffect(page) {
			return pipe(
				Effect.gen(function* parsePage() {
					const name = (yield* Effect.filterOrFail(
						getPropertyTextEffect(page.properties, "Name"),
						(text) => text.trim() !== "",
						() => new Error(`Page name is empty: ${JSON.stringify(page, null, 2)}`),
					)) as Branded<"raceName">

					const description = yield* Effect.tryPromise(() => fetchBlockChildrenContent(page.id))

					const abilities = yield* Effect.forEach(
						lines(yield* getPropertyTextEffect(page.properties, "Abilities")),
						function parseAbility(line: string) {
							return Effect.mapError(
								Effect.gen(function* () {
									const parts = line.split(/\s*-\s*/)
									const name = yield* Option.fromNullable(parts[0])
									const description = yield* Option.fromNullable(parts[1])
									return { name, description }
								}),
								(cause) =>
									new Error(`Race "${name}" has malformed ability line: ${line}`, { cause }),
							)
						},
					)

					return {
						name,
						description,
						abilities,
					}
				}),
				Effect.tapBoth({
					onSuccess: (race) => Console.info(`✅ Imported race "${race.name}"`),
					onFailure: (error) =>
						Console.warn(`⚠️ Failed to import race. ${error.message}\n${error.stack}`),
				}),
			)
		})
		return yield* Effect.allSuccesses(Iterator.from(effects), { concurrency: "inherit" })
	})
}

async function getGeneralSkills() {
	const client = new Client({
		auth: convexEnv().NOTION_API_SECRET,
	})

	const generalSkillsList = await client.databases.query({
		database_id: convexEnv().NOTION_GENERAL_SKILLS_DATABASE_ID,
	})

	return await Promise.all(
		generalSkillsList.results.map(asFullPage).map(async (page) => {
			const name = getPropertyText(page.properties, "Name")
			console.info(`Imported general skill ${name}`)
			return {
				name: name as Branded<"generalSkillName">,
				description: await fetchBlockChildrenContent(page.id),
			}
		}),
	)
}

async function getAttributes() {
	const client = new Client({
		auth: convexEnv().NOTION_API_SECRET,
	})

	const attributeList = await client.databases.query({
		database_id: convexEnv().NOTION_ATTRIBUTES_DATABASE_ID,
	})

	return await Promise.all(
		attributeList.results.map(asFullPage).map(async (page) => {
			const name = getPropertyText(page.properties, "Name")
			console.info(`Imported attribute ${name}`)
			return {
				name: name as Branded<"attributeName">,
				description: await fetchBlockChildrenContent(page.id),
				key: name.toLowerCase() as Infer<typeof notionImportProperties.attributes>[number]["key"],
			}
		}),
	)
}

async function getAspectSkills() {
	const client = new Client({
		auth: convexEnv().NOTION_API_SECRET,
	})

	const aspectSkillsresponse = await client.databases.query({
		database_id: convexEnv().NOTION_ASPECT_SKILLS_DATABASE_ID,
	})

	const aspectSkills = await Promise.all(
		aspectSkillsresponse.results.map(asFullPage).map(async (page) => {
			const name = getPropertyText(page.properties, "Name")
			const aspectDocs = await getRelatedPages(page.properties, "Aspects")
			const hidden = getBooleanProperty(page.properties, "Hidden")
			if (hidden) {
				console.info(`Aspect skill ${name} is hidden; skipping`)
				return
			}

			console.info(`imported aspect skill ${name}`)

			return {
				name: name as Branded<"aspectSkillName">,
				description: getPropertyText(page.properties, "Description"),
				aspects: aspectDocs.map(
					(doc) => getPropertyText(doc.properties, "Name") as Branded<"aspectName">,
				),
			}
		}),
	)
	return aspectSkills.filter(Boolean)
}

async function getAspects() {
	const client = new Client({
		auth: convexEnv().NOTION_API_SECRET,
	})

	const aspectsList = await client.databases.query({
		database_id: convexEnv().NOTION_ASPECTS_DATABASE_ID,
	})

	return await Promise.all(
		aspectsList.results.map(asFullPage).map(async (page) => {
			const content = await fetchBlockChildrenContent(page.id)
			const paragraphs = content.split("\n\n").filter(Boolean)
			const abilityParagraph =
				paragraphs.at(-1)?.replace(/^basic ability:\s*/i, "") ?? raise("Page has no content")
			const [abilityName, abilityDescription] = abilityParagraph.split(/\s*-\s*/)
			const name = getPropertyText(page.properties, "Name") as Branded<"aspectName">
			console.info(`Imported aspect ${name}`)
			return {
				name: name,
				description: paragraphs.slice(0, -1).join("\n\n"),
				ability: {
					name: abilityName ?? raise("no ability name"),
					description: abilityDescription ?? raise("no ability description"),
				},
			}
		}),
	)
}

function asFullPage(page: QueryDatabaseResponse["results"][number]): PageObjectResponse {
	if (!isFullPage(page)) {
		throw new Error(`Expected full page, got ${JSON.stringify(page, null, 2)}`)
	}
	return page
}

function getRichTextContent(items: RichTextItemResponse[]) {
	return items.map((item) => item.plain_text).join("")
}

function getPropertyText(properties: PageObjectResponse["properties"], name: string) {
	const property = getPageProperty(properties, name)
	switch (property?.type) {
		case "title":
			return getRichTextContent(property.title)
		case "rich_text":
			return getRichTextContent(property.rich_text)
		default:
			return ""
	}
}

const getPropertyTextEffect = (...args: Parameters<typeof getPropertyText>) =>
	Effect.try(() => getPropertyText(...args))

function getPageProperty(properties: PageObjectResponse["properties"], name: string) {
	const property = properties[name]
	if (!property) {
		throw new Error(`Property "${name}" does not exist: ${JSON.stringify(properties, null, 2)}`)
	}
	return property
}

async function fetchBlockChildrenContent(parentId: string): Promise<string> {
	const client = await Effect.runPromise(createNotionClient())

	const blocks = await client.blocks.children.list({ block_id: parentId })

	const textBlocks = await Promise.all(
		blocks.results.filter(isFullBlock).map(async (block) => {
			if (block.has_children) {
				return await fetchBlockChildrenContent(block.id)
			}
			if (block.type === "paragraph") {
				return getRichTextContent(block.paragraph.rich_text)
			}
			return ""
		}),
	)
	return textBlocks.join("\n\n")
}

const fetchBlockChildrenContentEffect = (...args: Parameters<typeof fetchBlockChildrenContent>) =>
	Effect.tryPromise(() => fetchBlockChildrenContent(...args))

async function getRelatedPages(properties: PageObjectResponse["properties"], name: string) {
	const property = getPageProperty(properties, name)
	if (property.type !== "relation") {
		throw new Error(
			`Property "${name}" is not a relation property: ${JSON.stringify(property, null, 2)}`,
		)
	}

	const client = await Effect.runPromise(createNotionClient())

	const responses = await Promise.all(
		property.relation.map(({ id }) => {
			return client.pages.retrieve({ page_id: id })
		}),
	)
	return responses.filter(isFullPage)
}

function getBooleanProperty(properties: PageObjectResponse["properties"], name: string) {
	const property = getPageProperty(properties, name)
	if (property.type !== "checkbox") {
		throw new Error(
			`Property "${name}" is not a checkbox property: ${JSON.stringify(property, null, 2)}`,
		)
	}
	return property.checkbox
}
