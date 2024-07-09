import { clerkSetup } from "@clerk/testing/playwright"
import test from "@playwright/test"

// const backendRoot = resolve(import.meta.dirname, "../convex-backend")
// const backendExecutable = resolve(backendRoot, "convex-local-backend")
// const backendFixtures = resolve(backendRoot, "fixtures")

// let backend: Subprocess

// test.beforeEach(async ({ context }) => {
// 	const fixturePath = resolve(backendFixtures, `${test.info().parallelIndex}`)
// 	await mkdir(fixturePath, { recursive: true })

// 	backend = execa(backendExecutable, {
// 		cwd: fixturePath,
// 		stdio: "inherit",
// 		reject: false,
// 	})
// 	backend.on("error", () => {})
// })

// test.afterEach(async () => {
// 	backend.kill()
// 	if (!backend.killed) {
// 		await once(backend, "exit")
// 	}
// 	const fixturePath = resolve(backendFixtures, `${test.info().parallelIndex}`)
// 	await rm(fixturePath, { recursive: true, force: true })
// })

test("setup clerk", async () => {
	await clerkSetup()
})
