import { unwrap } from "~/helpers/errors.ts"

const routeMap = import.meta.glob("./*/_route.tsx")
export function getTestCaseSlugs() {
	return Object.keys(routeMap)
		.map((path) => unwrap(path.split("/")[1]))
		.filter((it) => it !== "index")
		.sort()
}
