export type SecretName =
	| "DISCORD_CLIENT_ID"
	| "DISCORD_CLIENT_SECRET"
	| "CONVEX_SITE_URL"

export function getSecret(name: SecretName): string {
	const value = process.env[name]
	if (value === undefined) {
		throw new Error(`Missing secret "${name}"`)
	}
	return value
}
