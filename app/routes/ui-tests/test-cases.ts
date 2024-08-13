import { unwrap } from "../../../common/errors"

const routeMap = import.meta.glob("../ui-tests.*.tsx")
export function getTestCaseSlugs() {
	return Object.keys(routeMap)
		.map((path) => unwrap(path.match(/ui-tests.(.*)\.tsx/)?.[1]))
		.filter((it) => it !== "_index")
		.sort()
}
