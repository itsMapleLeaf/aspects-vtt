import type { MetaDescriptor } from "@remix-run/react"
import banner from "../../assets/banner.webp"

const site = {
	title: "Aspects of Nature",
	description: "Harness the power of nature to further your destiny.",
	domain: "https://aspects.mapleleaf.dev",
}

export function getSiteMeta(
	options: { title?: string; description?: string; image?: string } = {},
): MetaDescriptor[] {
	const title = [options.title, site.title].filter(Boolean).join(" | ")
	const description = options.description ?? site.description
	const themeColor = "#1e1f3e"
	return [
		{ title },
		{ name: "description", content: description },
		{ name: "theme-color", content: themeColor },

		{ property: "og:url", content: site.domain },
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:image", content: options.image ?? banner },

		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:domain", content: site.domain },
		{ name: "twitter:url", content: site.domain },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: options.image ?? banner },
	]
}
