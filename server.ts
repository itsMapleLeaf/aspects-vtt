/// <reference types="deno" />
import { serveDir } from "@std/http"
import type { ServerBuild } from "react-router"
import { createRequestHandler } from "react-router"
import * as serverBuild from "./build/server/index.js"

const serveRoute = createRequestHandler(
	serverBuild as unknown as ServerBuild,
	Deno.env.get("NODE_ENV"),
)

Deno.serve(async function handler(request) {
	const assetResponse = await serveDir(request, {
		fsRoot: "build/client",
		quiet: true,
	})
	if (assetResponse.ok) return assetResponse

	return serveRoute(request)
})
