import { ConvexHttpClient } from "convex/browser"
import { WithoutSystemFields } from "convex/server"
import { execa, ExecaError } from "execa"
import { mkdir } from "node:fs/promises"
import { platform } from "node:os"
import { resolve } from "node:path"
import waitOn from "wait-on"
import { api } from "../_generated/api.js"
import { Doc, Id } from "../_generated/dataModel"
import { EntTableNames } from "./ents.ts"

// unsensitive test-only credentials
const BACKEND_ADMIN_KEY = `0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd`
const JWT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY----- MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCz+CJOfsejQw6D 8VDsjvedIpstOn4+nNWpKPz+6IN4pYlXfx7K+Gwo6+g0RTkiQYjmPCJJbr49F977 uNmhLNRXjfDf/2XFZ9mptWWzKXH4BvZ1mRUN8ogMKn10TO2ZFYvF/ooZMZK4tlHa 1o2v7J0ZnHNFsZn2il3pyCRik/78zjs4o4GkOk5SgHBKXSGfi6ReqgYf5URAATcd zpwciqbAb3op0b0PTvRW0c70Vqa3I9szeysasYXRId01r8Kv330AomExCPWis0mX U7K6t91ZSwQJh6P0gb6zXTK+BfB0ZcnyzuuKEpza7m8QrPngM/ujMDFEQ3DzT0/o KeCcszD5AgMBAAECggEABkkMYuGGiOZPl55iGGTucz03nkociYTFaVTeYx7m11v9 EpwRf/64zlDdr8enVQT+nXKsf62/tKQEoskQ4FI2JBmq6wCaz6mbfm19dnCkQ5Va ROV0CNdRCfW8ItRV+JXG51yterxFvTA9TLW+EvUVUB64uU6LpUKtwK6yzWn3ffsJ 4RD17jBoeGcn1Job2rX0BH8qk0TZ7jObhI0vZrAOpXuJtGiA4o1lDgBqqgu4H+JI lakXj/uuB8XHrcOm2yCLrg15NUrFCP5IXi4U+7/+pvG0lMmoWGFU6gGKYlvYFNsR pt800EgyEwWEfy3mrkkhD2BZZ99OZZzViu+SUtJjBQKBgQDjSmYFqROcOHXYxjrH bHStOW1sU/fmltKOokFA6Nr/zjgv1DbPmEC+GpuEYoczvqaUStP6MSh/5pcXLBiJ 8WkuiMVOfpw/17zjAVBjwI/gV8RfMEat6rTjZvhmsx2kp0XKdQFNyxpO8PE3sz0s f48KgEEGJPVAs6hvUX95AEvCjQKBgQDKs5ENAzSUlYz2SdomKpapvfcKemHr1ZTC vNNTwYX/JNboc8qqGtWvDs+ou1dAPJjwrm2qco8wn+C0hHCGrOnJjMoomEQmyjpY pJS5bG6p9gy2Kcuz+6pXZ5xvqyng4EAuVuEyUZPPPBRu/gJtJtz+i9b2FQ2oDQyL k8uQ8dCDHQKBgQCy9zrbzCSvxlkshfF0YzZ/yw8Y1AkHXMyQGLxOssr1zte4+Vzr GtQnm+XGWJpiqQSbEUxV3O0pwFRJn6P2wcpzJKhPRSwcrO+Cwt8cnFvtZs4tsWKF wKALymFe5Dw8EKXIY1bSfVDKxbb5h71sU0g7GX+ZqfIerxe6By7bBNuiZQKBgQC4 HB1VmmG5y5Q7Z5zzKZ+rEVY/eCVU1avGrUetPYt90XI5tGKR2snXtTY8Zdy8Bc5M XcJSHLeeTLkGfXzPdmLqpCxCbvsH2IriVKqZOLnTOh8VniTdl2qC9SML8oWZMVZa QKNO1vXQNxvALIr7pV74/P8EiN7cku2gIV+2iU0AqQKBgACTCITZiiqKL/TLGSXS b7sbsfGSZKnMYfysF6A+BiN7f4GNU8pjSogeK1xCq5iL14H4ggl7pk6IHPXBQVj3 rcc3XrxDNHVdkBG+IREusk4oAjTT2YACQMUxoY6F9VVsx9hVVP2JA9sPZiVcOYse cEz4nQggDwoCL9/PrrrZiRG6 -----END PRIVATE KEY-----`
const JWKS = `{"keys":[{"use":"sig","kty":"RSA","n":"s_giTn7Ho0MOg_FQ7I73nSKbLTp-PpzVqSj8_uiDeKWJV38eyvhsKOvoNEU5IkGI5jwiSW6-PRfe-7jZoSzUV43w3_9lxWfZqbVlsylx-Ab2dZkVDfKIDCp9dEztmRWLxf6KGTGSuLZR2taNr-ydGZxzRbGZ9opd6cgkYpP-_M47OKOBpDpOUoBwSl0hn4ukXqoGH-VEQAE3Hc6cHIqmwG96KdG9D070VtHO9FamtyPbM3srGrGF0SHdNa_Cr999AKJhMQj1orNJl1OyurfdWUsECYej9IG-s10yvgXwdGXJ8s7rihKc2u5vEKz54DP7ozAxRENw809P6CngnLMw-Q","e":"AQAB"}]}`

const extension = platform() === "win32" ? ".exe" : ""

const backendBin = resolve(
	process.cwd(),
	`convex-backend/convex-local-backend${extension}`,
)

export type ConvexBackend = Awaited<ReturnType<typeof startConvexBackend>>
export async function startConvexBackend(id: string) {
	const url = "http://127.0.0.1:3210"
	const backendFolder = resolve("convex-backend", `data_${id}`)

	await mkdir(backendFolder, { recursive: true })

	const subprocess = execa(backendBin, {
		cwd: backendFolder,
		stdout: "inherit",
		stderr: "inherit",
	})
	subprocess.catch((error) => {
		if (error instanceof ExecaError) {
			console.info(`Server closed with exit code ${error.code}`)
		}
	})

	await waitOn({
		resources: ["tcp:0.0.0.0:3210"],
	})

	await execa`pnpm convex env set TEST true --admin-key ${BACKEND_ADMIN_KEY} --url ${url}`
	await execa(
		{},
	)`pnpm convex env set JWT_PRIVATE_KEY "${JWT_PRIVATE_KEY}" --admin-key ${BACKEND_ADMIN_KEY} --url ${url}`
	await execa`pnpm convex env set JWKS ${JWKS} --admin-key ${BACKEND_ADMIN_KEY} --url ${url}`
	await execa`pnpm convex deploy --admin-key ${BACKEND_ADMIN_KEY} --url ${url}`

	return {
		[Symbol.dispose]() {
			subprocess.kill("SIGINT")
		},
		stop() {
			subprocess.kill("SIGINT")
		},
		createClient() {
			const client = new ConvexHttpClient(url)
			return Object.assign(client, {
				db: {
					async insert<Table extends EntTableNames>(
						table: Table,
						doc: WithoutSystemFields<Doc<Table>>,
					) {
						return (await client.mutation(api.testing.db.insert, {
							table,
							doc,
						})) as Id<Table>
					},
					async update<Table extends EntTableNames>(
						table: Table,
						id: Id<Table>,
						patch: Partial<WithoutSystemFields<Doc<Table>>>,
					) {
						return await client.mutation(api.testing.db.update, {
							table,
							id,
							patch,
						})
					},
					async remove<Table extends EntTableNames>(
						table: Table,
						id: Id<Table>,
					) {
						await client.mutation(api.testing.db.remove, {
							table,
							id,
						})
					},
					async clear(table: EntTableNames) {
						await client.mutation(api.testing.db.clear, { table })
					},
					async reset() {
						await client.mutation(api.testing.db.reset)
					},
				},
			})
		},
	}
}
