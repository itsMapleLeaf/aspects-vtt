import * as fs from "node:fs/promises"
import { relative } from "node:path"
import { fileURLToPath } from "node:url"

const entries = await fs.readdir(new URL("../patches", import.meta.url), {
	recursive: true,
	withFileTypes: true,
})
for (const entry of entries) {
	if (!entry.isFile()) continue
	const path = new URL(`../patches/${entry.name}`, import.meta.url)
	const destination = new URL(`../node_modules/${entry.name}`, import.meta.url)
	await fs.rm(destination, { force: true })
	await fs.copyFile(path, destination)
	console.info(`${projectRelativePath(path)} -> ${projectRelativePath(destination)}`)
}

function projectRelativePath(path: string | URL) {
	return relative(process.cwd(), path instanceof URL ? fileURLToPath(path) : path)
}
