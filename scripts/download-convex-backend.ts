import { dirname } from "node:path"
import process from "node:process"
import { oraPromise } from "ora"

const tag = "precompiled-2024-07-25-4e0e27a"

const arch = "x86_64"

const platform =
	process.platform === "darwin" ? "apple-darwin"
	: process.platform === "win32" ? "pc-windows-msvc"
	: "unknown-linux-gnu"

const url = `https://github.com/get-convex/convex-backend/releases/download/${tag}/convex-local-backend-${arch}-${platform}.zip`
const destination = "data/convex-backend/convex-local-backend.zip"

console.table({
	tag,
	arch,
	platform,
	url,
	destination,
})

const res = await oraPromise(() => fetch(url), "Downloading")

await oraPromise(() => Bun.write(destination, res, { createPath: true }), "Saving")

const child = Bun.spawn(`unzip -o ${destination} -d ${dirname(destination)}`.split(" "))
await oraPromise(child.exited, "Unpacking")
