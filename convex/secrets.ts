import { raise } from "../common/errors"

type SecretName = "CLERK_JWT_ISSUER_DOMAIN" | "CLERK_SECRET_KEY"

export function getConvexSecret(name: SecretName) {
	return process.env[name] ?? raise(`Missing secret ${name}`, getConvexSecret)
}
