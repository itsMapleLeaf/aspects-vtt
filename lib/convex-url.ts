export function getConvexSiteUrl(convexUrl: string) {
	if (convexUrl.endsWith(".cloud")) {
		return convexUrl.replace(/\.cloud$/, ".site")
	}

	const parsed = new URL(convexUrl)
	if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)) {
		return `http://${parsed.hostname}:3211`
	}

	return convexUrl
}
