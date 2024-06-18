import { readFileSync } from "fs"
import { z } from "zod"
import { Aspects } from "../app/data/aspects.ts"
import { unwrap } from "../app/lib/errors.ts"

const notionApiKey = unwrap(process.env.NOTION_API_SECRET)

async function main() {
	// await createDatabasePage(
	// 	getDatabaseIdFromUrl(
	// 		`https://www.notion.so/aspects-of-nature/b511477895f14417b1f5537e97169838?v=3bb3c67c792b4127a387126c951df55a&pvs=4`,
	// 	),
	// 	{
	// 		properties: {
	// 			Name: textProperty("the"),
	// 		},
	// 		children: [paragraphBlock("the")],
	// 	},
	// )

	const pages = Aspects.values().map(
		(aspect): z.infer<typeof pageCreatePayloadSchema> => ({
			properties: {
				Name: titleProperty(aspect.name),
			},
			children: [paragraphBlock(readFileSync(`data/aspects/${aspect.name}.md`, "utf-8"))],
		}),
	)
	await diffPages(
		getDatabaseIdFromUrl(
			`https://www.notion.so/aspects-of-nature/b511477895f14417b1f5537e97169838?v=3bb3c67c792b4127a387126c951df55a&pvs=4`,
		),
		pages,
	)
}

async function diffPages(
	databaseId: string,
	pages: Iterable<z.infer<typeof pageCreatePayloadSchema>>,
) {
	const existingPagesByName = new Map(
		(await getDatabasePages(databaseId)).results.map((page) => [getPageName(page), page]),
	)
	for (const page of pages) {
		const existingPage = existingPagesByName.get(getPageName(page))
		if (existingPage) {
			await updatePageProperties(existingPage.id, {
				in_trash: true,
			})
		}
		await createDatabasePage(databaseId, page)
	}
}

const richTextSchema = z.object({
	type: z.literal("text"),
	text: z.object({
		content: z.string(),
		link: z.string().nullish(),
	}),
})

// const fileInputSchema = z.object({
// 	type: z.literal("file"),
// 	file: z.object({
// 		url: z.string(),
// 	}),
// })

const paragraphSchema = z.object({
	type: z.literal("paragraph"),
	paragraph: z.object({
		rich_text: z.array(richTextSchema),
	}),
})

const blockSchema = z
	.object({
		id: z.string(),
	})
	.and(z.union([paragraphSchema, z.object({})]))

const titlePropertySchema = z.object({
	title: z.array(richTextSchema),
})

const richTextPropertySchema = z.object({
	rich_text: z.array(richTextSchema),
})

const propertySchema = z.union([titlePropertySchema, richTextPropertySchema])

const pageCreatePayloadSchema = z
	.object({
		properties: z.record(z.string(), propertySchema),
		children: z.array(paragraphSchema).optional(),
	})
	.passthrough()

const listResultSchema = <T>(itemSchema: z.ZodSchema<T>) =>
	z
		.object({
			results: z.array(itemSchema),
		})
		.passthrough()

const pageSchema = pageCreatePayloadSchema
	.extend({
		id: z.string(),
	})
	.passthrough()

const pageListSchema = listResultSchema(pageSchema)
const blockListSchema = listResultSchema(blockSchema)

function getDatabaseIdFromUrl(url: string) {
	return new URL(url).pathname.split("/").pop()!
}

async function getDatabasePages(databaseId: string) {
	const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${notionApiKey}`,
			"Notion-Version": "2022-06-28",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			page_size: 100,
		}),
	})

	if (!response.ok) {
		throw new Error(`Failed to fetch database pages: ${response.statusText}`)
	}

	return pageListSchema.parse(await response.json())
}

async function createDatabasePage(
	databaseId: string,
	data: Omit<z.infer<typeof pageSchema>, "id">,
) {
	const response = await fetch(`https://api.notion.com/v1/pages`, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${notionApiKey}`,
			"Notion-Version": "2022-06-28",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			...data,
			parent: {
				database_id: databaseId,
			},
		}),
	})

	if (!response.ok) {
		throw new Error(`Failed to create page: ${response.statusText}`)
	}

	return pageSchema.parse(await response.json())
}

async function updatePageProperties(
	pageId: string,
	payload: {
		properties?: z.infer<typeof pageCreatePayloadSchema>["properties"]
		in_trash?: boolean
	},
) {
	const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
		method: "PATCH",
		headers: {
			"Authorization": `Bearer ${notionApiKey}`,
			"Notion-Version": "2022-06-28",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		throw new Error(`Failed to update page: ${response.statusText}`)
	}
}

async function getPageBlocks(pageId: string) {
	const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${notionApiKey}`,
			"Notion-Version": "2022-06-28",
			"Content-Type": "application/json",
		},
	})

	if (!response.ok) {
		throw new Error(`Failed to get page blocks: ${response.statusText}`)
	}

	return blockListSchema.parse(await response.json())
}

function getPageName(page: z.infer<typeof pageCreatePayloadSchema>) {
	return titlePropertySchema
		.parse(page.properties.Name)
		.title.map((block) => block.text.content)
		.join("")
}

function titleProperty(content: string): z.infer<typeof titlePropertySchema> {
	return {
		title: [richTextBlock(content)],
	}
}

function richTextBlock(content: string): z.infer<typeof richTextSchema> {
	return {
		type: "text",
		text: {
			content,
		},
	}
}

function paragraphBlock(content: string): z.infer<typeof paragraphSchema> {
	return {
		type: "paragraph",
		paragraph: {
			rich_text: [richTextBlock(content)],
		},
	}
}

await main()
