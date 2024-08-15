import type { MetaDescriptor } from "@remix-run/react"

const bannerUrl = new URL("../../assets/banner.webp", import.meta.url).href

export const site = {
	title: "Aspects of Nature",
	description: "Harness the power of nature to further your destiny.",
	domain: "https://aspects.mapleleaf.dev",
}

const titlePrefix =
	import.meta.env.PROD ? undefined
	: import.meta.env.DEV ? `[dev] `
	: `[${import.meta.env.MODE}] `

export function getSiteMeta(
	options: { title?: string; description?: string; image?: string } = {},
): MetaDescriptor[] {
	const title =
		titlePrefix + [options.title, site.title].filter(Boolean).join(" | ")

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
		{ property: "og:image", content: options.image ?? bannerUrl },

		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:domain", content: site.domain },
		{ name: "twitter:url", content: site.domain },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: options.image ?? bannerUrl },
	]
}
