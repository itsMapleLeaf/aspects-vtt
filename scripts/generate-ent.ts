import { relative } from "node:path"
import { exit } from "node:process"
import { argv, fileURLToPath } from "bun"
import { oraPromise } from "ora"

const [name] = argv.slice(2)
if (!name) {
	console.info("Usage: bun scripts/generate-ent.ts <name>")
	exit(1)
}

if (!/^[a-z][a-zA-Z]+$/.test(name)) {
	console.error(`Invalid name "${name}". Entities must be named in camelCase.`)
	exit(1)
}

const projectRoot = new URL("../", import.meta.url)

const typesPath = new URL(`./convex/${name}/types.ts`, projectRoot)
const functionsPath = new URL(`./convex/${name}/functions.ts`, projectRoot)
const schemaPath = new URL("./convex/schema.ts", projectRoot)

function displayPath(absolutePath: URL) {
	return relative(fileURLToPath(projectRoot), fileURLToPath(absolutePath))
}

function writeFile(path: URL, content: string) {
	return oraPromise(Bun.write(path, content), `Writing ${displayPath(path)}`)
}

async function runCommand(command: string) {
	const child = Bun.spawn(command.split(/\s+/), {
		stdio: ["inherit", "pipe", "pipe"],
	})
	await oraPromise(child.exited, `Running ${command}`)
}

await writeFile(
	typesPath,
	`import { v } from "convex/values"

export const ${name}Properties = {
	name: v.string(),
}
`,
)

await writeFile(
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
		return await ctx.table("${name}").getX(args.${name}Id).patch(args)
	},
})

export const remove = mutation({
	args: {
		${name}Id: v.id("${name}"),
	},
	handler: async (ctx, args) => {
		return await ctx.table("${name}").getX(args.${name}Id).delete()
	},
})
`,
)

let schemaContent = await oraPromise(Bun.file(schemaPath).text(), "Reading schema")

const generationMarker = "/* GENERATE-ENT */"

schemaContent = schemaContent.replace(
	generationMarker,
	`${name}: defineEnt(${name}Properties),

	${generationMarker}`,
)

schemaContent = `import { ${name}Properties } from "./${name}/types.ts"
${schemaContent}
`

await writeFile(schemaPath, schemaContent)

await runCommand("bunx convex codegen")
await runCommand("bunx biome check --apply convex")
