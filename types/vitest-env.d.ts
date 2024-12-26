import {
	MatchersStandalone,
	TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers"

import "vitest"
declare module "vitest" {
	interface Assertion<T> extends TestingLibraryMatchers<T, void> {}
	interface AsymmetricMatchersContaining extends MatchersStandalone {}
}
