import { getSecret } from "./lib/secrets.ts"

export default {
	providers: [
		{
			domain: getSecret("CONVEX_SITE_URL"),
			applicationID: "convex",
		},
	],
}
