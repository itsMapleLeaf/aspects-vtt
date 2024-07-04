#!/usr/bin/env -S bun

import AdmZip from "adm-zip"
import { mkdirSync, writeFileSync } from "node:fs"
import * as path from "node:path"

function getReleaseUrl() {
	const version = "precompiled-2024-05-20-997fa59"

	const suffix =
		process.platform === "win32" ? `pc-windows-msvc`
		: process.platform === "darwin" ? `apple-darwin`
		: `unknown-linux-gnu`

	return `https://github.com/get-convex/convex-backend/releases/download/${version}/convex-local-backend-x86_64-${suffix}.zip`
}

async function download(url: string, destination: string) {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Fetch failed: ${response.statusText}`)
	}
	const data = await response.arrayBuffer()
	mkdirSync(path.dirname(destination), { recursive: true })
	writeFileSync(destination, Buffer.from(data))
}

async function unzip(zipFile: string, destination: string) {
	const zip = new AdmZip(zipFile)
	zip.extractAllTo(destination, true)
}

console.info("Downloading...")
await download(
	getReleaseUrl(),
	path.resolve(import.meta.dirname, "../convex-backend/convex-backend.zip"),
)
console.info("Unzipping...")
await unzip(
	path.resolve(import.meta.dirname, "../convex-backend/convex-backend.zip"),
	path.resolve(import.meta.dirname, "../convex-backend"),
)
console.info("Done")
process.exit(0)
