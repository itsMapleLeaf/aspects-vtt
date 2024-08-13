// broken, do not use
import { spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, rmSync } from "node:fs"
import os from "node:os"
import { setTimeout } from "node:timers/promises"
import { fileURLToPath } from "node:url"

export const backendUrl = "http://127.0.0.1:3210"

const projectRoot = new URL("../../", import.meta.url)
const backendFolder = new URL("data/convex-backend/", projectRoot)
const backendBin = new URL("convex-local-backend", backendFolder)
const backendDataFolder = new URL("data/", backendFolder)

export async function startBackend() {
	const binaryPath = resolveBinaryPath()

	if (!existsSync(binaryPath)) {
		throw new Error(
			"Failed to find convex backend, make sure it's downloaded first!",
		)
	}

	rmSync(backendDataFolder, { recursive: true, force: true })
	mkdirSync(backendDataFolder, { recursive: true })

	const process = spawn(binaryPath, {
		cwd: fileURLToPath(backendDataFolder),
	})

	while (!(await isReachable(backendUrl))) {
		await setTimeout(100)
	}

	spawnSync(
		"pnpm",
		[
			"convex",
			"dev",
			"--once",
			"--admin-key",
			"0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd",
			"--url",
			backendUrl,
		],
		{ stdio: "inherit" },
	)

	console.info(`✓ Convex backend running at ${backendUrl}`)

	return {
		url: backendUrl,
		async [Symbol.asyncDispose]() {
			process.kill()
		},
	}
}

function resolveBinaryPath() {
	const binaryPath = fileURLToPath(backendBin)
	if (os.platform() === "win32") {
		return `${binaryPath}.exe`
	}
	return binaryPath
}

async function isReachable(input: string | URL | Request) {
	try {
		await fetch(input)
		return true
	} catch {
		return false
	}
}
