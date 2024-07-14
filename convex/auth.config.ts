export default {
	providers: [
		{
			domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
			applicationID: "convex",
		},
		{
			domain: process.env.CONVEX_SITE_URL,
			applicationID: "convex",
		},
	],
}
