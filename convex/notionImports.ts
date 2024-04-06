import { Client, isFullBlock, isFullPage } from "@notionhq/client"
import type {
	PageObjectResponse,
	QueryDatabaseResponse,
	RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { brandedString } from "convex-helpers/validators"
import { type Infer, v } from "convex/values"
import { raise } from "#app/common/errors.js"
import { internal } from "./_generated/api"
import { internalAction, internalMutation, query } from "./_generated/server"
import { convexEnv } from "./env.ts"
import type { Branded } from "./helpers.ts"

export const notionImportProperties = {
	attributes: v.array(
		v.object({
			name: brandedString("attributeName"),
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
			name: brandedString("raceName"),
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
			name: brandedString("aspectName"),
			description: v.string(),
			ability: v.object({
				name: v.string(),
				description: v.string(),
			}),
		}),
	),
	generalSkills: v.array(
		v.object({
			name: brandedString("generalSkillName"),
			description: v.string(),
		}),
	),
	aspectSkills: v.array(
		v.object({
			name: brandedString("aspectSkillName"),
			description: v.string(),
			aspects: v.array(brandedString("aspectName")),
		}),
	),
}

export const importData = internalAction({
	async handler(ctx) {
		const client = new Client({
			auth: convexEnv().NOTION_API_SECRET,
		})

		const [aspectsList, aspectSkillsList, generalSkillsList, racesList, attributeList] =
			await Promise.all([
				client.databases.query({
					database_id: convexEnv().NOTION_ASPECTS_DATABASE_ID,
				}),
				client.databases.query({
					database_id: convexEnv().NOTION_ASPECT_SKILLS_DATABASE_ID,
				}),
				client.databases.query({
					database_id: convexEnv().NOTION_GENERAL_SKILLS_DATABASE_ID,
				}),
				client.databases.query({
					database_id: convexEnv().NOTION_RACES_DATABASE_ID,
				}),
				client.databases.query({
					database_id: convexEnv().NOTION_ATTRIBUTES_DATABASE_ID,
				}),
			])

		await ctx.runMutation(internal.notionImports.create, {
			aspects: await Promise.all(
				aspectsList.results.map(async (page) => {
					assertIsFullPage(page)
					const content = await fetchBlockChildrenContent(page.id)
					const paragraphs = content.split("\n\n")
					const abilityParagraph =
						paragraphs.at(-1)?.replace(/^basic ability:\s*/i, "") ?? raise("Page has no content")
					const [abilityName, abilityDescription] = abilityParagraph.split(/\s*-\s*/)
					return {
						name: getPropertyText(page.properties, "Name") as Branded<"aspectName">,
						description: paragraphs.slice(0, -1).join("\n\n"),
						ability: {
							name: abilityName ?? raise("no ability name"),
							description: abilityDescription ?? raise("no ability description"),
						},
					}
				}),
			),

			aspectSkills: await Promise.all(
				aspectSkillsList.results.map(async (page) => {
					assertIsFullPage(page)
					const name = getPropertyText(page.properties, "Name")
					const aspectDocs = await getRelatedPages(page.properties, "Aspects")
					return {
						name: name as Branded<"aspectSkillName">,
						description: getPropertyText(page.properties, "Description"),
						aspects: aspectDocs.map(
							(doc) => getPropertyText(doc.properties, "Name") as Branded<"aspectName">,
						),
					}
				}),
			),

			attributes: await Promise.all(
				attributeList.results.map(async (page) => {
					assertIsFullPage(page)
					const name = getPropertyText(page.properties, "Name")
					return {
						name: name as Branded<"attributeName">,
						description: await fetchBlockChildrenContent(page.id),
						key: name.toLowerCase() as Infer<
							typeof notionImportProperties.attributes
						>[number]["key"],
					}
				}),
			),

			generalSkills: await Promise.all(
				generalSkillsList.results.map(async (page) => {
					assertIsFullPage(page)
					const name = getPropertyText(page.properties, "Name")
					return {
						name: name as Branded<"generalSkillName">,
						description: await fetchBlockChildrenContent(page.id),
					}
				}),
			),

			races: (
				await Promise.all(
					racesList.results.map(async (page) => {
						assertIsFullPage(page)
						const name = getPropertyText(page.properties, "Name")

						const abilities = getPropertyText(page.properties, "Abilities")
							.split(/\s*\n\s*/)
							.filter(Boolean)
							.map((line) => {
								const [name, description] = line.split(/\s*-\s*/)
								return {
									name: name ?? raise(`no ability name`),
									description: description ?? raise(`no ability description`),
								}
							})

						return {
							name: name as Branded<"raceName">,
							description: await fetchBlockChildrenContent(page.id),
							abilities,
						}
					}),
				)
			).filter((item) => item.name),
		})
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

function assertIsFullPage(
	page: QueryDatabaseResponse["results"][number],
): asserts page is PageObjectResponse {
	if (!isFullPage(page)) {
		throw new Error(`Expected full page, got ${JSON.stringify(page)}`)
	}
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
		throw new Error(`Property "${name}" does not exist: ${JSON.stringify(properties)}`)
	}
	return property
}

async function fetchBlockChildrenContent(parentId: string): Promise<string> {
	const client = createNotionClient()

	const blocks = await client.blocks.children.list({ block_id: parentId })

	const textBlocks = await Promise.all(
		blocks.results.map(async (block) => {
			if (!isFullBlock(block)) {
				return null
			}
			if (block.has_children) {
				return await fetchBlockChildrenContent(block.id)
			}
			switch (block.type) {
				case "paragraph":
					return getRichTextContent(block.paragraph.rich_text)
				default:
					return ""
			}
		}),
	)
	return textBlocks.filter(Boolean).join("\n\n")
}

function createNotionClient() {
	return new Client({
		auth: convexEnv().NOTION_API_SECRET,
	})
}

async function getRelatedPages(properties: PageObjectResponse["properties"], name: string) {
	const property = getPageProperty(properties, name)
	if (property.type !== "relation") {
		throw new Error(`Property "${name}" is not a relation property: ${JSON.stringify(property)}`)
	}

	const client = createNotionClient()

	const responses = await Promise.all(
		property.relation.map(({ id }) => {
			return client.pages.retrieve({ page_id: id })
		}),
	)
	return responses.filter(isFullPage)
}
