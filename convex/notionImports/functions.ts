import { Client, isFullBlock, isFullPage } from "@notionhq/client"
import type {
	PageObjectResponse,
	QueryDatabaseResponse,
	RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { Infer } from "convex/values"
import { Iterator } from "iterator-helpers-polyfill"
import { promiseAllObject } from "../../app/common/async.ts"
import { raise } from "../../app/common/errors.ts"
import { prettify } from "../../app/common/json.ts"
import { lines } from "../../app/common/string.ts"
import { internal } from "../_generated/api"
import { internalAction } from "../_generated/server"
import { convexEnv } from "../env.ts"
import type { Branded } from "../helpers/convex.ts"
import { type QueryCtx, internalMutation, query } from "../helpers/ents.ts"
import { notionImportProperties } from "./types.ts"

export const importData = internalAction({
	async handler(ctx) {
		await ctx.runMutation(
			internal.notionImports.functions.create,
			await promiseAllObject({
				aspects: getAspects(),
				attributes: getAttributes(),
				generalSkills: getGeneralSkills(),
				races: getRaces(),
			}),
		)
	},
})

export const get = query({
	async handler(ctx) {
		return await getNotionImports(ctx)
	},
})

export const create = internalMutation({
	args: notionImportProperties,
	async handler(ctx, args) {
		await ctx.db.insert("notionImports", args)
	},
})

export async function getNotionImports(ctx: QueryCtx) {
	return await ctx.db.query("notionImports").order("desc").first()
}

function createNotionClient() {
	return new Client({
		auth: convexEnv().NOTION_API_SECRET,
	})
}

async function getDatabasePages(databaseId: string) {
	const client = createNotionClient()
	const response = await client.databases.query({
		database_id: databaseId,
	})
	return Iterator.from(response.results).map((page) => {
		if (!isFullPage(page)) {
			throw new Error(`Result is not a full page: ${prettify(page)}`)
		}
		return page
	})
}

async function getRaces() {
	const pages = await getDatabasePages(convexEnv().NOTION_RACES_DATABASE_ID)
	return await promiseAllSuccesses(pages, {
		map: async (page) => {
			const name = asNonEmptyString(getPropertyText(page.properties, "Name"))
			const description = await fetchBlockChildrenContent(page.id)

			const abilities = lines(getPropertyText(page.properties, "Abilities"))
				.map((line) => line.split(/\s*-\s*/))
				.map((parts) => ({
					name: asNonEmptyString(parts[0]),
					description: asNonEmptyString(parts[1]),
				}))
				.toArray()

			console.info(`Imported race "${name}"`)
			return {
				id: `races:${page.id}` as Branded<"races">,
				name,
				description,
				abilities,
			}
		},
		onError: (error, value) => {
			console.error(`Failed to import race.`, error, value)
		},
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
				id: `generalSkills:${page.id}` as Branded<"generalSkills">,
				name,
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
				id: `attributes:${page.id}` as Branded<"attributes">,
				name,
				description: await fetchBlockChildrenContent(page.id),
				key: name.toLowerCase() as Infer<typeof notionImportProperties.attributes>[number]["key"],
			}
		}),
	)
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
				id: `aspects:${page.id}` as Branded<"aspects">,
				name,
				description: paragraphs.slice(0, -1).join("\n\n"),
				ability: {
					name: abilityName ?? raise("no ability name"),
					description: abilityDescription ?? "",
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

function getPageProperty(properties: PageObjectResponse["properties"], name: string) {
	const property = properties[name]
	if (!property) {
		throw new Error(`Property "${name}" does not exist: ${JSON.stringify(properties, null, 2)}`)
	}
	return property
}

async function fetchBlockChildrenContent(parentId: string): Promise<string> {
	const client = createNotionClient()

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

async function promiseAllSuccesses<Input, Output>(
	values: Iterable<Input>,
	options: {
		map: (input: Input) => Output
		onError: (error: unknown, value: Input) => void
	},
): Promise<Awaited<Output>[]> {
	const results = await Promise.allSettled(
		Iterator.from(values).map(async (value) => {
			try {
				return options.map(await value)
			} catch (error) {
				options.onError(error, value)
				throw error
			}
		}),
	)
	return results.filter((result) => result.status === "fulfilled").map((result) => result.value)
}

function asNonEmptyString(value: unknown) {
	if (typeof value !== "string") {
		throw new Error(`Expected string, received: ${prettify(value)}`)
	}
	if (value.trim() === "") {
		throw new Error("Expected non-empty string")
	}
	return value
}
