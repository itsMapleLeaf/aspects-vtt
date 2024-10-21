import { GlobalRegistrator } from "@happy-dom/global-registrator"
import { afterEach, expect } from "vitest"

GlobalRegistrator.register()

// using dynamic import to ensure registrator runs before the matcher code,
// which relies on browser globals to exist at import time
const matchers = await import("@testing-library/jest-dom/matchers")
const { cleanup } = await import("@testing-library/react")

expect.extend(matchers as typeof matchers.default) // lol

// cleans up `render` after each test
afterEach(() => {
	cleanup()
})
