import type { LoaderFunctionArgs } from "@remix-run/node"
import { Duration } from "effect"
import { LRUCache } from "lru-cache"
import { $params } from "remix-routes"
import sharp from "sharp"
import { z } from "zod"
import { clientEnv } from "~/env.ts"
import { unwrap } from "~/helpers/errors.ts"

const cache = new LRUCache<string, Promise<Uint8Array>>({
	max: 1000,
	ttl: Duration.toMillis(Duration.hours(1)),
})

const headers = {
	"Content-Type": "image/webp",
	"Cache-Control": "public, max-age=31536000",
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const cached = cache.get(url.href)
	if (cached) {
		return new Response(await cached, { headers })
	}

	const { id } = $params("/images/:id", params)
	const promise = processApiImage(id, request, url)
	cache.set(url.href, promise)
	return new Response(await promise, { headers })
}

async function processApiImage(id: string, request: Request, url: URL) {
	const apiImageUrl = new URL("/image", clientEnv.VITE_CONVEX_URL.replace(/\.cloud\/*$/, ".site"))
	apiImageUrl.host = "www." + apiImageUrl.host
	apiImageUrl.searchParams.set("id", id)

	const response = await fetch(apiImageUrl.href, request)
	let data: Uint8Array = new Uint8Array(await response.arrayBuffer())

	const areaParam = url.searchParams.get("area")
	if (areaParam) {
		const areaParamSchema = z
			.string()
			.transform((value) => value.split(",").map(Number))
			.pipe(z.tuple([z.number().int(), z.number().int(), z.number().int(), z.number().int()]))

		const rect = areaParamSchema.parse(areaParam)
		data = await cropImage(data, ...rect)
	}
	return data
}

async function cropImage(input: Uint8Array, x: number, y: number, width: number, height: number) {
	const image = sharp(input)
	const meta = await image.metadata()

	const buffer = await image
		.extract({
			left: x,
			top: y,
			width: Math.min(width, unwrap(meta.width) - x),
			height: Math.min(height, unwrap(meta.height) - y),
		})
		.toFormat("webp")
		.toBuffer()

	return new Uint8Array(buffer)
}
