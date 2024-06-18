import type { MDXModule } from "mdx/types.js"
import { titleCase } from "../../common/string.ts"

const pages = new Map(
	Object.entries(import.meta.glob("./content/**/*.md")).map(([id, loader]) => {
		const segments = id.toLowerCase().replaceAll(/\.md$/g, "").split("/").slice(2)
		const title = segments.at(-1)
		const path = segments.join("/")
		const route = `/guide/${path}`
		const page = {
			link: { id, route, title: title ? titleCase(title) : route },
			load: loader as () => Promise<MDXModule>,
		}
		return [path, page]
	}),
)

export function getPage(path: string) {
	return pages.get(path)
}

export function getPageLinks() {
	return [...new Set(pages.values())].map((page) => page.link)
}

export function normalizePageLink(href: string) {
	const route = href.toLowerCase().replaceAll(/\.md$/g, "")
	return pages.has(route) ? `/guide/${route}` : href
}
