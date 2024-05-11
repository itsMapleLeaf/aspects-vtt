import { exit } from "node:process"
import { argv } from "bun"
import { $ } from "bun"

const [name] = argv.slice(2)
if (!name) {
	console.info("Usage: bun scripts/generate-ent.ts <name>")
	exit(1)
}

if (!/^[a-z][a-zA-Z]+$/.test(name)) {
	console.error(`Invalid name "${name}". Entities must be named in camelCase.`)
	exit(1)
}

const typesPath = new URL(`../convex/${name}/types.ts`, import.meta.url)
const functionsPath = new URL(`../convex/${name}/functions.ts`, import.meta.url)
const schemaPath = new URL("../convex/schema.ts", import.meta.url)

await Bun.write(
	typesPath,
	`import { v } from "convex/values"

export const ${name}Properties = {
	name: v.string(),
}
`,
)

await Bun.write(
	functionsPath,
	`import { v } from "convex/values"
import { query, mutation } from "../helpers/ents.ts"
import { partial } from "../helpers/convex.ts"
import { ${name}Properties } from "./types.ts"

export const get = query({
	args: {
		${name}Id: v.id("${name}")
	},
	handler: async (ctx, args) => {
		return await ctx.table("${name}").get(args.${name}Id)
	},
})

export const list = query({
	handler: async (ctx) => {
		return await ctx.table("${name}").docs()
	},
})

export const create = mutation({
	args: {
		...${name}Properties,
		${name}Id: v.id("${name}"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("${name}").insert(args)
	},
})

export const update = mutation({
	args: {
		...partial(${name}Properties),
		${name}Id: v.id("${name}"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("test").getX(args.testId).patch(args)
	},
})

export const remove = mutation({
	args: {
		${name}Id: v.id("${name}"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("test").getX(args.testId).delete()
	},
})
`,
)

let schemaContent = await Bun.file(schemaPath).text()

const generationMarker = "/* GENERATE-ENT */"

schemaContent = schemaContent.replace(
	generationMarker,
	`${name}: defineEnt(${name}Properties),

	${generationMarker}`,
)

schemaContent = `import { ${name}Properties } from "./${name}/types.ts"
${schemaContent}
`

await Bun.write(schemaPath, schemaContent)

await $`convex codegen`
await $`biome check --apply convex`
