import { execa } from "execa"
import { arch, platform } from "node:os"
import { dirname, resolve } from "node:path"
import { match } from "ts-pattern"
import * as v from "valibot"

console.info("Fetching github releases...")
const { stdout } =
	await execa`gh release list --repo get-convex/convex-backend --limit 1 --json tagName`

const latestTag = v.parse(
	v.pipe(
		v.string(),
		v.transform((out) => JSON.parse(out)),
		v.tuple([v.object({ tagName: v.string() })]),
		v.transform((result) => result[0].tagName),
	),
	stdout,
)
console.info({ latestTag })

const system = { platform: platform(), arch: arch() }
console.info(system)

const suffix = match(system)
	.with({ platform: "darwin", arch: "arm32" }, () => "aarch64-apple-darwin")
	.with({ platform: "darwin" }, () => "x86_64-apple-darwin")
	.with({ platform: "win32" }, () => "x86_64-pc-windows-msvc")
	.with({ arch: "arm32" }, () => "aarch64-unknown-linux-gnu")
	.otherwise(() => "x86_64-unknown-linux-gnu")

const releaseUrl = `https://github.com/get-convex/convex-backend/releases/download/${latestTag}/convex-local-backend-${suffix}.zip`
console.info({ releaseUrl })

const downloadPath = resolve("convex-backend", "convex-local-backend.zip")
console.info({ downloadPath })
await execa`mkdir -p ${dirname(downloadPath)}`

console.info("Fetching backend...")
await execa`wget ${releaseUrl} -O ${downloadPath}`

console.info("Unpacking...")
await execa`unzip -o ${downloadPath} -d convex-backend`

console.info("%cDone", "color:green")
