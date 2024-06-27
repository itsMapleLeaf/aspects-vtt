import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { getTestCaseSlugs } from "../helpers.ts"

export async function loader({ request }: LoaderFunctionArgs) {
	const slugs = getTestCaseSlugs()
	return slugs[0] ? redirect(`./${slugs[0]}`) : null
}
